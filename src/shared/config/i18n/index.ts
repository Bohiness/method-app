// src/shared/config/i18n/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Импортируем JSON файлы с переводами
import en from './resources/en.json'
import ru from './resources/ru.json'

const LANGUAGE_KEY = '@app_language';

// Получение сохраненного языка
export const getStoredLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return language || 'en';
  } catch {
    return 'en';
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
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      en: {
        translation: typeof en;
      };
      ru: {
        translation: typeof ru;
      };
    };
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ru: {
        translation: ru,
      },
    },
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