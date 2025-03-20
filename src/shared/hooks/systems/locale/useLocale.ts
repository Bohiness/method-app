// src/shared/hooks/useLocale.ts
import { getStoredLanguage } from '@shared/config/i18n';
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { useUser } from '@shared/context/user-provider';
import { useStorage } from '@shared/lib/storage/storage.service';
import { SupportedLocale } from '@shared/types/locale/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LocaleStorageProps {
    initialLocale?: SupportedLocale;
}

export const useLocale = ({ initialLocale = 'ru' }: LocaleStorageProps = {}) => {
    const { i18n } = useTranslation();
    const { user, updateUser } = useUser();
    const [locale, setLocale] = useState<SupportedLocale>(initialLocale);
    const [hour12, setHour12] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const storage = useStorage();

    // Флаг для предотвращения зацикливания
    const isUpdatingLocale = useRef(false);

    // Загрузка локали при инициализации
    useEffect(() => {
        const loadLocale = async () => {
            try {
                setIsLoading(true);

                // Приоритет:
                // 1. Язык пользователя (если авторизован)
                // 2. Сохраненный язык в хранилище
                // 3. Язык по умолчанию (initialLocale)

                let newLocale = initialLocale;

                // Проверяем язык пользователя
                if (user && !user.is_anonymous_user && user.language) {
                    newLocale = user.language as SupportedLocale;
                } else {
                    // Проверяем сохраненный язык
                    const storedLanguage = await getStoredLanguage();
                    if (storedLanguage) {
                        newLocale = storedLanguage as SupportedLocale;
                    }
                }

                // Устанавливаем локаль без вызова updateLocale
                setLocale(newLocale);

                // Не вызываем i18n.changeLanguage здесь, так как это будет сделано в LanguageProvider
            } catch (error) {
                console.error('Failed to load locale:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadLocale();
    }, [initialLocale, user, storage, getStoredLanguage]);

    // Функция для обновления локали
    const updateLocale = async (newLocale: SupportedLocale) => {
        // Если уже обновляем или локаль не изменилась, ничего не делаем
        if (isUpdatingLocale.current || newLocale === locale) {
            return;
        }

        try {
            isUpdatingLocale.current = true;
            setLocale(newLocale);

            // Сохраняем в хранилище
            await storage.set(STORAGE_KEYS.APP_LOCALE as any, newLocale);

            // Обновляем язык пользователя, если он авторизован и не анонимный
            if (user && !user.is_anonymous_user) {
                try {
                    await updateUser({ language: newLocale });
                } catch (error) {
                    console.error('Failed to update user language:', error);
                }
            }
        } catch (error) {
            console.error('Failed to update locale:', error);
            throw error;
        } finally {
            isUpdatingLocale.current = false;
        }
    };

    return {
        locale,
        hour12,
        setHour12,
        updateLocale,
        isLoading,
    };
};
