import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime';
import { addDays, isSameDay, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const getDateText = (date: Date): string => {
    const { getGreeting, formateDataTimeWithTimezoneAndLocale } = useDateTime();
    const { t } = useTranslation();
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);

    if (isSameDay(date, today)) {
        return getGreeting();
    }
    if (isSameDay(date, yesterday)) {
        return t('calendar.yesterday');
    }
    if (isSameDay(date, tomorrow)) {
        return t('calendar.tomorrow');
    }
    return formateDataTimeWithTimezoneAndLocale(date, 'dd MMMM');
};
