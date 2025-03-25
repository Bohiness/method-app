import { useLocale } from '@shared/hooks/systems/locale/useLocale';
import { toneOfVoiceService } from '@shared/lib/ai/tone-of-voice.service';
import { logger } from '@shared/lib/logger/logger.service';
import { settingsOfAiType, VoiceToneType } from '@shared/types/ai/VoiceTone';
import { useEffect, useState } from 'react';
import { useAI } from './useAI';

/**
 * Хук для работы с тонами голоса AI
 *
 * Предоставляет доступ к текущему тону, списку всех тонов
 * и методам для управления тонами голоса AI
 */
export const useToneOfVoice = () => {
    const { locale } = useLocale();
    const [loading, setLoading] = useState(true);
    const [currentTone, setCurrentTone] = useState<VoiceToneType>();
    const [allTones, setAllTones] = useState<VoiceToneType[]>([]);
    const [currentToneIndex, setCurrentToneIndex] = useState(0);
    const { streamResponse } = useAI();

    // Получение нейтрального тона (по умолчанию первый в списке)
    const getNeutralTone = (tones: VoiceToneType[]): VoiceToneType => {
        // Если есть тон с id 'neutral_nitron', используем его
        const neutralTone = tones.find(tone => tone.name_id === 'neutral_nitron');
        if (neutralTone) return neutralTone;

        // Иначе используем первый тон в списке
        return tones[0];
    };

    // Загрузка текущего тона и всех доступных тонов
    useEffect(() => {
        const loadTone = async () => {
            setLoading(true);

            try {
                // Получаем все доступные тона
                const tones = toneOfVoiceService.getVoiceTones(locale);
                setAllTones(tones);

                if (tones.length === 0) {
                    // Даже если нет тонов, используем defaultTone
                    setCurrentTone(tones[0]);
                    setLoading(false);
                    return;
                }

                // Загружаем текущий сохраненный тон
                const { tone, index } = await toneOfVoiceService.loadSavedTone(locale);

                // Если тон найден, используем его, иначе используем нейтральный
                if (tone) {
                    setCurrentTone(tone);
                    setCurrentToneIndex(index);
                } else {
                    // Используем нейтральный тон
                    const neutralTone = getNeutralTone(tones);
                    setCurrentTone(neutralTone);
                    setCurrentToneIndex(tones.indexOf(neutralTone));

                    // Сохраняем нейтральный тон как выбранный
                    await toneOfVoiceService.saveTone(neutralTone.name_id);
                }
            } catch (error) {
                console.error('Error in useToneOfVoice:', error);

                // В случае ошибки, все равно устанавливаем нейтральный тон, если есть тона
                if (allTones.length > 0) {
                    const neutralTone = getNeutralTone(allTones);
                    setCurrentTone(neutralTone);
                    setCurrentToneIndex(allTones.indexOf(neutralTone));
                } else {
                    // Если нет тонов вообще, используем defaultTone
                    setCurrentTone(allTones[0]);
                }
            } finally {
                setLoading(false);
            }
        };

        loadTone();
    }, [locale]);

    // Подписка на изменения тона в любом месте приложения
    useEffect(() => {
        // Функция-обработчик изменений тона
        const handleToneChange = async (toneId: string) => {
            try {
                const newTone = toneOfVoiceService.getToneById(toneId, locale);
                const newIndex = toneOfVoiceService.getToneIndexById(toneId, locale);

                if (newTone) {
                    setCurrentTone(newTone);
                    setCurrentToneIndex(newIndex);
                    logger.log(newTone, 'newTone');
                }
            } catch (error) {
                console.error('Error handling tone change:', error);
            }
        };

        // Подписываемся на изменения тона
        const unsubscribe = toneOfVoiceService.subscribe(handleToneChange);

        // Отписываемся при размонтировании компонента
        return () => {
            unsubscribe();
        };
    }, [locale]);

    /**
     * Изменить и сохранить тон голоса
     */
    const changeTone = async (toneIdOrIndex: string | number) => {
        if (allTones.length === 0) return currentTone; // Возвращаем текущий тон если список пуст

        setLoading(true);

        try {
            let toneId: string;
            let newIndex: number;

            // Определяем, передан ли индекс или ID тона
            if (typeof toneIdOrIndex === 'number') {
                newIndex = toneIdOrIndex;
                const tone = toneOfVoiceService.getToneByIndex(newIndex, locale);
                toneId = tone.name_id;
            } else {
                toneId = toneIdOrIndex;
                newIndex = toneOfVoiceService.getToneIndexById(toneId, locale);
            }

            // Сохраняем тон
            await toneOfVoiceService.saveTone(toneId);

            // Обновляем состояние
            const newTone = toneOfVoiceService.getToneById(toneId, locale);
            if (newTone) {
                setCurrentTone(newTone);
                setCurrentToneIndex(newIndex);
                return newTone;
            }

            // Если новый тон не найден, сохраняем текущий
            return currentTone;
        } catch (error) {
            console.error('Error changing tone:', error);
            return currentTone; // В случае ошибки возвращаем текущий тон
        } finally {
            setLoading(false);
        }
    };

    /**
     * Изменить тон по индексу
     */
    const changeToneByIndex = (index: number) => {
        return changeTone(index);
    };

    /**
     * Изменить тон по ID
     */
    const changeToneById = (toneId: string) => {
        return changeTone(toneId);
    };

    /**
     * Получить следующий тон
     */
    const selectNextTone = () => {
        const newIndex = currentToneIndex === allTones.length - 1 ? 0 : currentToneIndex + 1;
        return changeToneByIndex(newIndex);
    };

    /**
     * Получить предыдущий тон
     */
    const selectPrevTone = () => {
        const newIndex = currentToneIndex === 0 ? allTones.length - 1 : currentToneIndex - 1;
        return changeToneByIndex(newIndex);
    };

    /**
     * Обработка текста с использованием AI в текущем тоне голоса с возможностью стриминга
     * @param {string} text - Текст для обработки
     * @param {Function} onPartialResponse - Колбэк для промежуточных результатов стриминга
     * @returns {Promise<string>} - Обработанный текст
     */
    const goDeeper = async ({
        text,
        settingsOfAi,
        onPartialResponse,
    }: {
        text: string;
        settingsOfAi?: settingsOfAiType;
        onPartialResponse?: (partialResponse: string) => void;
    }): Promise<string> => {
        try {
            logger.log(`Запуск goDeeper с тоном: ${currentTone?.name_id}`, 'useToneOfVoice – goDeeper');

            // Используем streamResponse из useAI для получения ответа с поддержкой стриминга
            const response = await streamResponse({
                text,
                settingsOfAi: {
                    toneOfVoice: settingsOfAi?.toneOfVoice ?? currentTone?.name_id,
                    typeOfDeeper: settingsOfAi?.typeOfDeeper,
                },
                onStream: onPartialResponse,
            });

            logger.log(response, 'useToneOfVoice – goDeeper', 'final complete response');
            return response;
        } catch (error) {
            logger.error(error, 'useToneOfVoice – goDeeper', 'error');
            return 'Ошибка при получении ответа от AI';
        }
    };

    return {
        // Состояния
        loading,
        currentTone,
        allTones,
        currentToneIndex,

        // Методы
        changeTone,
        changeToneByIndex,
        changeToneById,
        selectNextTone,
        selectPrevTone,

        // Методы для работы с глубиной тона
        goDeeper,
    };
};
