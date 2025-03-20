import { useMoodCheckinByCalendarWeek, useMoodCheckinStats } from '../mood/useMoodCheckin';

export const useStatsMoodCheckinConverter = ({ days }: { days: number }) => {
    const { currentPeriodData, previousPeriodData, currentAvg, previousAvg, isLoading } = useMoodCheckinStats(days);

    // Функция для преобразования массива записей в массив средних значений по дням
    const transformDataToDailyArray = (data: any[]) => {
        if (!data || data.length === 0) {
            return Array(days).fill(0);
        }

        // Находим последнюю дату (самую новую запись)
        const sortedData = [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestDate = new Date(sortedData[0].created_at);

        // Создаем объект для накопления значений по дням
        const dayMap: { [key: string]: { sum: number; count: number } } = {};

        // Инициализируем массив данных по дням
        const dailyData = Array(days).fill(0);

        // Перебираем все записи
        data.forEach(item => {
            const date = new Date(item.created_at);
            // Определяем, сколько дней назад была сделана запись
            const daysDiff = Math.floor((latestDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

            // Учитываем только записи, которые попадают в нужный период
            if (daysDiff >= 0 && daysDiff < days) {
                // Используем дату (без времени) как ключ
                const dateKey = date.toISOString().split('T')[0];

                if (!dayMap[dateKey]) {
                    dayMap[dateKey] = { sum: 0, count: 0 };
                }

                dayMap[dateKey].sum += item.mood_level;
                dayMap[dateKey].count += 1;
            }
        });

        // Заполняем массив данными
        Object.entries(dayMap).forEach(([dateStr, { sum, count }]) => {
            const date = new Date(dateStr);
            const daysDiff = Math.floor((latestDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff >= 0 && daysDiff < days) {
                // Индекс в массиве - это количество дней назад (0 - самый последний день)
                dailyData[daysDiff] = sum / count;
            }
        });

        return dailyData;
    };

    // Преобразуем данные текущего и предыдущего периода
    const dailyCurrentData = transformDataToDailyArray(currentPeriodData || []);
    const dailyPreviousData = transformDataToDailyArray(previousPeriodData || []);

    return {
        currentPeriodData: dailyCurrentData,
        previousPeriodData: dailyPreviousData,
        currentAvg,
        previousAvg,
        isLoading,
        rawCurrentPeriodData: currentPeriodData,
        rawPreviousPeriodData: previousPeriodData,
    };
};

/**
 * Хук для преобразования данных календарной недели в формат для WeeklyChart
 * Возвращает массивы данных по дням недели (пн, вт, ср, чт, пт, сб, вс)
 */
export const useCalendarWeekMoodConverter = () => {
    const {
        currentPeriodData,
        previousPeriodData,
        currentAvg,
        previousAvg,
        isLoading,
        currentWeekBoundaries,
        previousWeekBoundaries,
    } = useMoodCheckinByCalendarWeek();

    // Функция для преобразования массива записей в массив средних значений по дням недели
    const transformDataToWeekdayArray = (data: any[], weekStart: Date) => {
        // Создаем массив для 7 дней недели (0-6, где 0 - понедельник, 6 - воскресенье)
        const weekData = Array(7).fill(0);

        // Объект для накопления значений по дням недели
        const dayAccumulator: { [key: number]: { sum: number; count: number } } = {};

        // Инициализируем аккумулятор для всех дней недели
        for (let i = 0; i < 7; i++) {
            dayAccumulator[i] = { sum: 0, count: 0 };
        }

        // Перебираем все записи
        if (data && data.length > 0) {
            data.forEach(item => {
                // Парсим дату из строки
                const date = new Date(item.created_at);

                // Вычисляем день недели относительно начала недели (0 - пн, 6 - вс)
                const dayOfWeek = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

                // Проверяем, что день недели находится в пределах недели
                if (dayOfWeek >= 0 && dayOfWeek < 7) {
                    // Добавляем значение настроения к аккумулятору для этого дня
                    dayAccumulator[dayOfWeek].sum += item.mood_level;
                    dayAccumulator[dayOfWeek].count += 1;
                }
            });
        }

        // Вычисляем средние значения для каждого дня недели
        for (let i = 0; i < 7; i++) {
            if (dayAccumulator[i].count > 0) {
                weekData[i] = dayAccumulator[i].sum / dayAccumulator[i].count;
            }
            // Если count = 0, оставляем 0 (уже установлено при инициализации)
        }

        return weekData;
    };

    // Преобразуем данные текущей и предыдущей недели
    const currentWeekData = transformDataToWeekdayArray(
        currentPeriodData || [],
        currentWeekBoundaries?.startOfWeek || new Date()
    );

    const previousWeekData = transformDataToWeekdayArray(
        previousPeriodData || [],
        previousWeekBoundaries?.startOfWeek || new Date()
    );

    return {
        currentPeriodData: currentWeekData,
        previousPeriodData: previousWeekData,
        currentAvg,
        previousAvg,
        isLoading,
        rawCurrentPeriodData: currentPeriodData,
        rawPreviousPeriodData: previousPeriodData,
    };
};
