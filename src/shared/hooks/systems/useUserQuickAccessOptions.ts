import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { IconName } from '@shared/ui/icon';
import { useCallback, useEffect, useState } from 'react';
import { AppActivity } from '../systems/useAppActivity'; // Используем для типа activityToAdd

// Интерфейс опции быстрого доступа
export interface QuickAccessOption {
    id: string; // Уникальный ID для React key
    key: AppActivity['key']; // Ключ для логики и actionMap
    icon: IconName;
    titleKey: string;
}

const STORAGE_KEY = STORAGE_KEYS.SETTINGS.QUICK_ACCESS;

export interface UseQuickAccessSettingsReturn {
    options: QuickAccessOption[];
    isLoading: boolean;
    error: Error | null;
    // addOption теперь требует key
    addOption: (activityToAdd: Pick<AppActivity, 'id' | 'key' | 'icon' | 'titleKey'>) => Promise<void>;
    // removeOption теперь принимает key
    removeOption: (optionKeyToRemove: AppActivity['key']) => Promise<void>;
    setOptions: (newOptions: QuickAccessOption[]) => Promise<void>;
    loadOptions: () => Promise<void>;
}

export const useQuickAccessSettings = (): UseQuickAccessSettingsReturn => {
    const [options, setInternalOptions] = useState<QuickAccessOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Функция сохранения: сохраняем id, key, icon, titleKey
    const _saveOptions = useCallback(async (currentOptions: QuickAccessOption[]) => {
        try {
            // Сохраняем все нужные поля
            const optionsToSave = currentOptions.map(({ id, key, icon, titleKey }) => ({ id, key, icon, titleKey }));
            const jsonValue = JSON.stringify(optionsToSave);
            logger.info(jsonValue, 'Saving quick access options:');
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
            setError(null);
        } catch (e) {
            console.error('Failed to save quick access options:', e);
            const err = e instanceof Error ? e : new Error('Failed to save quick access options');
            setError(err);
            throw err;
        }
    }, []);

    // Функция загрузки: проверяем id и key более строго
    const loadOptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue !== null) {
                const parsedOptions: QuickAccessOption[] = JSON.parse(jsonValue);
                if (Array.isArray(parsedOptions)) {
                    // Улучшенный фильтр: проверяем, что key не null и не undefined
                    const validOptions = parsedOptions.filter(
                        opt =>
                            opt && // Проверяем, что сам объект существует
                            typeof opt.id === 'string' &&
                            opt.id &&
                            typeof opt.key === 'string' &&
                            opt.key && // Убедимся, что key это непустая строка
                            typeof opt.icon === 'string' &&
                            opt.icon &&
                            typeof opt.titleKey === 'string' &&
                            opt.titleKey
                    );
                    // Дополнительная проверка на случай дубликатов key, если нужно
                    const uniqueKeys = new Set<string>();
                    const uniqueValidOptions = validOptions.filter(opt => {
                        if (uniqueKeys.has(opt.key)) {
                            console.warn(`Duplicate key found during load: ${opt.key}`);
                            return false;
                        }
                        uniqueKeys.add(opt.key);
                        return true;
                    });
                    logger.info(uniqueValidOptions, 'Unique valid options:');
                    setInternalOptions(uniqueValidOptions);

                    // Если после фильтрации что-то изменилось, можно перезаписать хранилище
                    if (validOptions.length !== parsedOptions.length) {
                        logger.warn('Some invalid quick access options were filtered out during load.');
                        await _saveOptions(validOptions);
                    }
                } else {
                    logger.warn('Invalid quick access options format, resetting.');
                    setInternalOptions([]);
                    await _saveOptions([]);
                }
            } else {
                setInternalOptions([]);
            }
        } catch (e) {
            console.error('Failed to load quick access options:', e);
            const err = e instanceof Error ? e : new Error('Failed to load quick access options');
            setError(err);
            setInternalOptions([]);
        } finally {
            setIsLoading(false);
        }
    }, [_saveOptions]);

    // Загрузка при монтировании
    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    // Функции модификации
    const addOption = useCallback(
        // Тип параметра теперь соответствует интерфейсу
        async (activityToAdd: Pick<AppActivity, 'id' | 'key' | 'icon' | 'titleKey'>) => {
            // Проверяем дубликаты по key
            if (options.some(opt => opt.key === activityToAdd.key)) {
                console.warn(`Option with key ${activityToAdd.key} already exists.`);
                return;
            }
            const newOption: QuickAccessOption = {
                id: activityToAdd.id, // Сохраняем id для React key
                key: activityToAdd.key, // Сохраняем key для логики
                icon: activityToAdd.icon,
                titleKey: activityToAdd.titleKey,
            };
            const updatedOptions = [...options, newOption];
            setInternalOptions(updatedOptions);
            try {
                await _saveOptions(updatedOptions);
            } catch (saveError) {
                setInternalOptions(options); // Откат
                console.error('Reverted addOption due to save error.');
            }
        },
        [options, _saveOptions]
    );

    const removeOption = useCallback(
        // Параметр теперь optionKeyToRemove и имеет тип AppActivity['key']
        async (optionKeyToRemove: AppActivity['key']) => {
            // Фильтруем по key
            const updatedOptions = options.filter(opt => opt.key !== optionKeyToRemove);
            setInternalOptions(updatedOptions);
            try {
                await _saveOptions(updatedOptions);
            } catch (saveError) {
                setInternalOptions(options); // Откат
                console.error('Reverted removeOption due to save error.');
            }
        },
        [options, _saveOptions]
    );

    const setOptions = useCallback(
        async (newOptions: QuickAccessOption[]) => {
            const currentOptions = options;
            // Убедимся, что в newOptions есть все нужные поля перед сохранением
            const validNewOptions = newOptions
                .map(opt => ({
                    id: opt.id || `${opt.key}-${Date.now()}`, // Генерируем id, если его нет
                    key: opt.key,
                    icon: opt.icon,
                    titleKey: opt.titleKey,
                }))
                .filter(opt => opt.id && opt.key && opt.icon && opt.titleKey);

            setInternalOptions(validNewOptions);
            try {
                await _saveOptions(validNewOptions);
            } catch (saveError) {
                setInternalOptions(currentOptions); // Откат
                console.error('Reverted setOptions due to save error.');
            }
        },
        [_saveOptions, options]
    );

    return {
        options,
        isLoading,
        error,
        addOption,
        removeOption,
        setOptions,
        loadOptions,
    };
};
