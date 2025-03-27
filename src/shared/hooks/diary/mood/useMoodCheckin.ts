// src/shared/hooks/mood/useMoodCheckin.ts
import { MoodSyncService } from '@shared/api/diary/MoodSyncService';
import { APP_ROUTES } from '@shared/constants/system/app-routes';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { MoodStorageService } from '@shared/lib/diary/MoodStorageService';
import { logger } from '@shared/lib/logger/logger.service';
import { Emotion, Factor, MoodCheckin } from '@shared/types/diary/mood/MoodType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';

const moodStorageService = new MoodStorageService();
const moodSyncService = new MoodSyncService(moodStorageService);

export const useMoodCheckin = () => {
    const openMoodCheckinModal = () => {
        router.push(`/${APP_ROUTES.MODALS.DIARY.MOOD}`);
    };

    return {
        openMoodCheckinModal,
    };
};

export const useCreateMoodCheckin = () => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();

    const debouncedSync = useMemo(
        () =>
            debounce(async () => {
                try {
                    await moodSyncService.syncChanges();
                    queryClient.invalidateQueries({ queryKey: ['mood-stats'] });
                } catch (error) {
                    console.error('Failed to sync after create:', error);
                }
            }, 1000),
        [queryClient]
    );

    return useMutation({
        mutationFn: async (data: Omit<MoodCheckin, 'id' | 'created_at'>) => {
            console.log('useCreateMoodCheckin: Получены данные для сохранения:', data);

            // Проверка данных перед сохранением
            if (data.mood_level < 1 || data.mood_level > 5) {
                throw new Error(`Некорректный уровень настроения: ${data.mood_level}`);
            }

            if (!Array.isArray(data.emotions)) {
                throw new Error('Поле emotions должно быть массивом');
            }

            if (!Array.isArray(data.factors)) {
                throw new Error('Поле factors должно быть массивом');
            }

            try {
                // Сохраняем в локальное хранилище
                const newCheckin = await moodStorageService.createMoodCheckin(data);
                console.log('useCreateMoodCheckin: Данные успешно сохранены:', newCheckin);

                // Если онлайн, запускаем дебаунсированную синхронизацию
                if (isOnline) {
                    console.log('useCreateMoodCheckin: Устройство онлайн, запускаем синхронизацию');
                    debouncedSync();
                } else {
                    console.log('useCreateMoodCheckin: Устройство оффлайн, синхронизация отложена');
                }

                return newCheckin;
            } catch (error) {
                console.error('useCreateMoodCheckin: Ошибка при сохранении данных:', error);
                throw error;
            }
        },
        onSuccess: data => {
            console.log('useCreateMoodCheckin: Мутация успешно выполнена, инвалидируем запросы');
            queryClient.invalidateQueries({ queryKey: ['mood-checkins'] });
        },
        onError: error => {
            console.error('useCreateMoodCheckin: Ошибка при выполнении мутации:', error);
        },
    });
};

export const useMoodHistory = () => {
    const { isOnline } = useNetwork();
    const queryClient = useQueryClient();

    return useQuery<MoodCheckin[], Error>({
        queryKey: ['mood-checkins'],
        queryFn: async () => {
            if (isOnline) {
                try {
                    await moodSyncService.syncChanges();
                } catch (error) {
                    console.error('Failed to sync changes:', error);
                }
            }
            return moodStorageService.getMoodCheckins();
        },
    });
};

// Вспомогательные функции
export const moodHelpers = {
    getEmotionsByMoodLevel: (emotions: Emotion[] | undefined, level: number) =>
        emotions?.filter(emotion => emotion.mood_level === level) || [],

    getMoodLevelStats: (stats: any[] | undefined, level: number) => stats?.find(stat => stat.mood_level === level),

    getEmotionName: (emotions: Emotion[] | undefined, id: number) => emotions?.find(emotion => emotion.id === id)?.name,

    getFactorName: (factors: Factor[] | undefined, id: number) => factors?.find(factor => factor.id === id)?.name,
};

export const useMoodCheckinStats = (days: number) => {
    const {
        data: currentPeriodData,
        isLoading,
        error,
    } = useQuery<MoodCheckin[], Error>({
        queryKey: ['mood-checkins', 'current', days],
        queryFn: () => moodStorageService.getMoodCheckinsByDays(days),
    });

    const { data: previousPeriodData } = useQuery<MoodCheckin[], Error>({
        queryKey: ['mood-checkins', 'previous', days],
        queryFn: () => moodStorageService.getMoodCheckinsByDaysRange(days, days * 2),
    });

    // Вычисление среднего значения mood_level для текущего периода
    const currentAvg = useMemo(() => {
        if (!currentPeriodData || currentPeriodData.length === 0) return 0;
        const sum = currentPeriodData.reduce((acc, checkin) => acc + checkin.mood_level, 0);
        return sum / currentPeriodData.length;
    }, [currentPeriodData]);

    // Вычисление среднего значения mood_level для предыдущего периода
    const previousAvg = useMemo(() => {
        if (!previousPeriodData || previousPeriodData.length === 0) return 0;
        const sum = previousPeriodData.reduce((acc, checkin) => acc + checkin.mood_level, 0);
        return sum / previousPeriodData.length;
    }, [previousPeriodData]);

    useEffect(() => {
        logger.log(currentPeriodData, 'useMoodCheckinStats', 'currentPeriodData');
        logger.log(previousPeriodData, 'useMoodCheckinStats', 'previousPeriodData');
        logger.log(currentAvg, 'useMoodCheckinStats', 'currentAvg');
        logger.log(previousAvg, 'useMoodCheckinStats', 'previousAvg');
    }, [currentPeriodData, previousPeriodData, currentAvg, previousAvg]);

    return {
        currentPeriodData,
        previousPeriodData,
        currentAvg,
        previousAvg,
        isLoading,
        error,
    };
};

/**
 * Хук для получения данных о настроении по календарным неделям
 * Возвращает данные за текущую неделю (с понедельника по воскресенье)
 * и за предыдущую календарную неделю
 */
export const useMoodCheckinByCalendarWeek = () => {
    const queryClient = useQueryClient();

    // Функция для получения дат начала и конца календарной недели
    const getWeekBoundaries = (weekOffset = 0) => {
        const now = new Date();
        const dayOfWeek = now.getDay() || 7; // Воскресенье = 0, преобразуем в 7

        // Получаем дату начала текущей недели (понедельник)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek + 1 - weekOffset * 7);
        startOfWeek.setHours(0, 0, 0, 0);

        // Получаем дату конца недели (воскресенье)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return { startOfWeek, endOfWeek };
    };

    // Получаем границы текущей недели
    const currentWeek = getWeekBoundaries(0);
    // Получаем границы предыдущей недели
    const previousWeek = getWeekBoundaries(1);

    // Запрос данных за текущую неделю
    const {
        data: currentWeekData,
        isLoading: isCurrentLoading,
        error: currentError,
    } = useQuery<MoodCheckin[], Error>({
        queryKey: ['mood-checkins', 'current-week', currentWeek.startOfWeek.toISOString()],
        queryFn: async () => {
            // Получаем все записи и фильтруем их по дате
            const allCheckins = await moodStorageService.getMoodCheckins();
            return allCheckins.filter(checkin => {
                const checkinDate = new Date(checkin.created_at);
                return checkinDate >= currentWeek.startOfWeek && checkinDate <= currentWeek.endOfWeek;
            });
        },
    });

    // Запрос данных за предыдущую неделю
    const {
        data: previousWeekData,
        isLoading: isPreviousLoading,
        error: previousError,
    } = useQuery<MoodCheckin[], Error>({
        queryKey: ['mood-checkins', 'previous-week', previousWeek.startOfWeek.toISOString()],
        queryFn: async () => {
            // Получаем все записи и фильтруем их по дате
            const allCheckins = await moodStorageService.getMoodCheckins();
            return allCheckins.filter(checkin => {
                const checkinDate = new Date(checkin.created_at);
                return checkinDate >= previousWeek.startOfWeek && checkinDate <= previousWeek.endOfWeek;
            });
        },
    });

    // Вычисление среднего значения mood_level для текущей недели
    const currentAvg = useMemo(() => {
        if (!currentWeekData || currentWeekData.length === 0) return 0;
        const sum = currentWeekData.reduce((acc, checkin) => acc + checkin.mood_level, 0);
        return sum / currentWeekData.length;
    }, [currentWeekData]);

    // Вычисление среднего значения mood_level для предыдущей недели
    const previousAvg = useMemo(() => {
        if (!previousWeekData || previousWeekData.length === 0) return 0;
        const sum = previousWeekData.reduce((acc, checkin) => acc + checkin.mood_level, 0);
        return sum / previousWeekData.length;
    }, [previousWeekData]);

    // Логирование для отладки
    useEffect(() => {
        logger.log(currentWeekData, 'useMoodCheckinByCalendarWeek', 'currentWeekData');
        logger.log(previousWeekData, 'useMoodCheckinByCalendarWeek', 'previousWeekData');
        logger.log(currentAvg, 'useMoodCheckinByCalendarWeek', 'currentAvg');
        logger.log(previousAvg, 'useMoodCheckinByCalendarWeek', 'previousAvg');
        logger.log(currentWeek, 'useMoodCheckinByCalendarWeek', 'currentWeek');
        logger.log(previousWeek, 'useMoodCheckinByCalendarWeek', 'previousWeek');
    }, [currentWeekData, previousWeekData, currentAvg, previousAvg, currentWeek, previousWeek]);

    return {
        currentPeriodData: currentWeekData || [],
        previousPeriodData: previousWeekData || [],
        currentAvg,
        previousAvg,
        isLoading: isCurrentLoading || isPreviousLoading,
        error: currentError || previousError,
        currentWeekBoundaries: currentWeek,
        previousWeekBoundaries: previousWeek,
    };
};
