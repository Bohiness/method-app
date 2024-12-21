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
    return language || 'ru';
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
export const initI18n = async () => {
  const storedLanguage = await getStoredLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en,
        ru,
      },
      lng: storedLanguage,
      fallbackLng: 'ru',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
};

export default i18n;