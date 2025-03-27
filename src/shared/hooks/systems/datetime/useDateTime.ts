// src/shared/hooks/useDateTime.ts
import { format, formatRelative as formatRelativeFns } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../locale/useLocale';
import { useTimeZoneStorage } from './useTimeZoneStorage';

interface UseDateTime {
    isLocaleLoaded: boolean;
    isTimeZoneLoaded: boolean;
    locale: string;
    timeZone: string;
    formatDateTime: (date: string | Date, pattern?: string) => string;
    formatDateTimeWithTimezoneAndLocale: (date: string | Date, pattern?: string) => string;
    formatDateTimeWithLocale: (date: string | Date, pattern?: string) => string;
    convertToTimeZone: (date: string | Date) => Date;
    convertToLocale: (date: string | Date) => Date;
    convertToTimeZoneAndLocale: (date: string | Date) => Date;
    formatRelative: (date: string | Date) => string;
    updateLocale: (locale: 'ru' | 'en') => Promise<void>;
    updateTimeZone: (timeZone: string) => Promise<void>;
}

export const useDateTime = (): UseDateTime => {
    const { locale, updateLocale, isLoading: isLocaleLoading, dateFnsLocale } = useLocale();
    const { timeZone, updateTimeZone, isLoading: isTimeZoneLoading } = useTimeZoneStorage();
    const { t } = useTranslation();

    const formatDateTimeWithTimezoneAndLocale = (date: string | Date, pattern = 'dd MMMM, EEEE HH:mm'): string => {
        if (!date) return '';

        try {
            const dateObject = typeof date === 'string' ? new Date(date) : date;

            return formatInTimeZone(dateObject, timeZone, pattern, {
                locale: dateFnsLocale,
            });
        } catch (error) {
            console.error('Error formatting date with timezone and locale:', error);
            return '';
        }
    };

    const formatDateTimeWithLocale = (date: string | Date, pattern = 'dd MMMM, EEEE HH:mm'): string => {
        if (!date) return '';

        try {
            const dateObject = typeof date === 'string' ? new Date(date) : date;

            return format(dateObject, pattern, {
                locale: dateFnsLocale,
            });
        } catch (error) {
            console.error('Error formatting date with locale:', error);
            return '';
        }
    };

    const formatDateTime = (date: string | Date, pattern = 'dd MMMM, EEEE HH:mm'): string => {
        if (!date) return '';

        try {
            const dateObject = typeof date === 'string' ? new Date(date) : date;

            return format(dateObject, pattern);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    const convertToTimeZone = (date: string | Date): Date => {
        if (!date) return new Date();

        try {
            const dateObject = typeof date === 'string' ? new Date(date) : date;
            const dateString = formatInTimeZone(dateObject, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            return new Date(dateString);
        } catch (error) {
            console.error('Error converting date to timezone:', error);
            return new Date();
        }
    };

    const convertToLocale = (date: string | Date): Date => {
        if (!date) return new Date();

        try {
            const dateObject = typeof date === 'string' ? new Date(date) : date;
            // Для локали мы просто возвращаем объект Date, так как локаль влияет только на форматирование
            return dateObject;
        } catch (error) {
            console.error('Error converting date to locale:', error);
            return new Date();
        }
    };

    const convertToTimeZoneAndLocale = (date: string | Date): Date => {
        if (!date) return new Date();

        try {
            // Фактически это то же самое, что и convertToTimeZone,
            // так как локаль влияет только на форматирование
            return convertToTimeZone(date);
        } catch (error) {
            console.error('Error converting date to timezone and locale:', error);
            return new Date();
        }
    };

    const formatRelative = (date: string | Date): string => {
        if (!date) return '';

        try {
            const dateObject = typeof date === 'string' ? new Date(date) : date;
            return formatRelativeFns(dateObject, new Date(), { locale: dateFnsLocale });
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
        formatDateTimeWithTimezoneAndLocale,
        formatDateTimeWithLocale,
        convertToTimeZone,
        convertToLocale,
        convertToTimeZoneAndLocale,
        formatRelative,
        updateLocale,
        updateTimeZone,
    };
};
