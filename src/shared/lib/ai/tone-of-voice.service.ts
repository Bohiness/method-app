import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { voiceTonesEN } from '@shared/data/initial/voiceTones/voiceTonesEN';
import { voiceTonesRu } from '@shared/data/initial/voiceTones/voiceTonesRu';
import { VoiceTone } from '@shared/types/ai/VoiceTone';

type ToneChangeListener = (toneId: string) => void;

// Реализуем механизм подписки на изменения тона
const listeners: ToneChangeListener[] = [];

export const toneOfVoiceService = {
    /**
     * Подписывается на изменения тона голоса
     */
    subscribe: (listener: ToneChangeListener): (() => void) => {
        listeners.push(listener);

        // Возвращаем функцию отписки
        return () => {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    },

    /**
     * Уведомляет всех подписчиков об изменении тона
     */
    notifyListeners: (toneId: string): void => {
        listeners.forEach(listener => listener(toneId));
    },

    /**
     * Получает все доступные тона голоса в зависимости от локали
     */
    getVoiceTones: (locale: string): VoiceTone[] => {
        return locale === 'ru' ? voiceTonesRu : voiceTonesEN;
    },

    /**
     * Получает тон голоса по его идентификатору
     */
    getToneById: (toneId: string, locale: string): VoiceTone | undefined => {
        const tones = toneOfVoiceService.getVoiceTones(locale);
        return tones.find(tone => tone.name_id === toneId);
    },

    /**
     * Получает индекс тона по его идентификатору
     */
    getToneIndexById: (toneId: string, locale: string): number => {
        const tones = toneOfVoiceService.getVoiceTones(locale);
        return tones.findIndex(tone => tone.name_id === toneId);
    },

    /**
     * Получает тон голоса по его индексу
     */
    getToneByIndex: (index: number, locale: string): VoiceTone => {
        const tones = toneOfVoiceService.getVoiceTones(locale);
        return tones[index] || tones[0];
    },

    /**
     * Сохраняет выбранный тон голоса в AsyncStorage
     */
    saveTone: async (toneId: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.AI_TONE_OF_VOICE, toneId);
            // Уведомляем всех подписчиков об изменении
            toneOfVoiceService.notifyListeners(toneId);
        } catch (error) {
            console.error('Error saving voice tone:', error);
        }
    },

    /**
     * Загружает сохраненный тон голоса из AsyncStorage
     */
    loadSavedTone: async (
        locale: string
    ): Promise<{
        tone?: VoiceTone;
        index: number;
    }> => {
        try {
            const savedToneId = await AsyncStorage.getItem(STORAGE_KEYS.AI_TONE_OF_VOICE);
            if (savedToneId) {
                const tones = toneOfVoiceService.getVoiceTones(locale);
                const index = tones.findIndex(tone => tone.name_id === savedToneId);

                if (index !== -1) {
                    return { tone: tones[index], index };
                }
            }

            // Если тон не найден или не сохранен, возвращаем индекс 0 (первый тон)
            return { index: 0 };
        } catch (error) {
            console.error('Error loading voice tone:', error);
            return { index: 0 };
        }
    },

    /**
     * Получает текущий выбранный тон для использования в AI
     */
    getCurrentTone: async (locale: string): Promise<VoiceTone> => {
        const { tone, index } = await toneOfVoiceService.loadSavedTone(locale);
        if (tone) return tone;

        // Если тон не был найден, возвращаем первый тон
        return toneOfVoiceService.getToneByIndex(index, locale);
    },
};
