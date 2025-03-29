// src/shared/config/i18n/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импортируем JSON файлы с переводами
import en from './resources/en.json';
import ru from './resources/ru.json';

// Импортируем файлы переводов для coach
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import coachEn from './resources/coach/en.json';
import coachRu from './resources/coach/ru.json';
const resources = {
    en: {
        translation: {
            ...en,
            coach: coachEn,
        },
    },
    ru: {
        translation: {
            ...ru,
            coach: coachRu,
        },
    },
};

// Используем тот же ключ, что и в useLocale
const LANGUAGE_KEY = STORAGE_KEYS.APP.APP_LOCALE;

// Получение сохраненного языка
export const getStoredLanguage = async () => {
    try {
        // Сначала пробуем получить из AsyncStorage
        const language = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (language) return language;

        // Если не нашли, пробуем старый ключ для обратной совместимости
        const oldLanguage = await AsyncStorage.getItem('@app_language');
        if (oldLanguage) {
            // Мигрируем на новый ключ
            await AsyncStorage.setItem(LANGUAGE_KEY, oldLanguage);
            return oldLanguage;
        }

        return 'ru'; // По умолчанию русский
    } catch {
        return 'ru';
    }
};

// Сохранение выбранного языка
export const setStoredLanguage = async (language: string) => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
        console.error('Error saving language:', error);
    }
};

// Инициализация i18next
declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: typeof resources;
    }
}

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

export default i18n;
