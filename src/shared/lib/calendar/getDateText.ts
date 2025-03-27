import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime';
import { addDays, isSameDay, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const getDateText = (date: Date): string => {
    const { formatDateTimeWithTimezoneAndLocale } = useDateTime();
    const { t } = useTranslation();
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);

    const getGreeting = (): string => {
        const hour = new Date().getHours();

        if (hour >= 4 && hour < 12) return (t('calendar.greeting.morning') as string).toLowerCase();
        if (hour >= 12 && hour < 17) return (t('calendar.greeting.afternoon') as string).toLowerCase();
        if (hour >= 17 && hour < 23) return (t('calendar.greeting.evening') as string).toLowerCase();
        return (t('calendar.greeting.night') as string).toLowerCase();
    };

    if (isSameDay(date, today)) {
        return getGreeting();
    }
    if (isSameDay(date, yesterday)) {
        return (t('calendar.yesterday') as string).toLowerCase();
    }
    if (isSameDay(date, tomorrow)) {
        return (t('calendar.tomorrow') as string).toLowerCase();
    }
    return formatDateTimeWithTimezoneAndLocale(date, 'dd MMMM').toLowerCase();
};
