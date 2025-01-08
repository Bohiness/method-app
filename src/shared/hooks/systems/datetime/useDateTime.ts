// src/shared/hooks/useDateTime.ts
import { format, formatInTimeZone } from 'date-fns-tz'
import { enGB, ru } from 'date-fns/locale'
import { useLocale } from '../locale/useLocale'
import { useTimeZoneStorage } from './useTimeZoneStorage'

interface UseDateTime {
  isLocaleLoaded: boolean;
  isTimeZoneLoaded: boolean;
  locale: string;
  timeZone: string;
  formatDateTime: (date: string | Date, pattern?: string) => string;
  getGreeting: () => string;
  formatRelative: (date: string | Date) => string;
  updateLocale: (locale: 'ru' | 'en') => Promise<void>;
  updateTimeZone: (timeZone: string) => Promise<void>;
}

export const useDateTime = (): UseDateTime => {
  const { locale, updateLocale, isLoading: isLocaleLoading } = useLocale();
  const { timeZone, updateTimeZone, isLoading: isTimeZoneLoading } = useTimeZoneStorage();

  // Маппинг локалей
  const locales = {
    ru,
    en: enGB,
  };

  const formatDateTime = (
    date: string | Date,
    pattern = 'dd MMMM, EEEE HH:mm'
  ): string => {
    if (!date) return '';

    try {
      const dateObject = typeof date === 'string' ? new Date(date) : date;
      
      return formatInTimeZone(dateObject, timeZone, pattern, {
        locale: locales[locale],
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (locale === 'ru') {
      if (hour >= 4 && hour < 12) return 'доброе утро';
      if (hour >= 12 && hour < 17) return 'добрый день';
      if (hour >= 17 && hour < 23) return 'добрый вечер';
      return 'доброй ночи';
    } else {
      if (hour >= 4 && hour < 12) return 'good morning';
      if (hour >= 12 && hour < 17) return 'good afternoon';
      if (hour >= 17 && hour < 23) return 'good evening';
      return 'good night';
    }
  };

  const formatRelative = (date: string | Date): string => {
    if (!date) return '';

    try {
      const dateObject = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - dateObject.getTime()) / 36e5;

      if (diffInHours < 24) {
        return format(dateObject, 'HH:mm', { locale: locales[locale] });
      } else if (diffInHours < 48) {
        return locale === 'ru' ? 'вчера' : 'yesterday';
      } else {
        return format(dateObject, 'dd MMM', { locale: locales[locale] });
      }
    } catch (error) {
      console.error('Error formatting relative date:', error);
      return '';
    }
  };

  return {
    isLocaleLoaded: !isLocaleLoading,
    isTimeZoneLoaded: !isTimeZoneLoading,
    locale,
    timeZone,
    formatDateTime,
    getGreeting,
    formatRelative,
    updateLocale,
    updateTimeZone,
  };
};