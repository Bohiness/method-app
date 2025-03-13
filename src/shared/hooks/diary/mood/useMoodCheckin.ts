// src/shared/hooks/mood/useMoodCheckin.ts
import { MoodSyncService } from '@shared/api/diary/MoodSyncService';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { MoodStorageService } from '@shared/lib/diary/MoodStorageService';
import { Emotion, Factor, MoodCheckin } from '@shared/types/diary/mood/MoodType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';

const moodStorageService = new MoodStorageService();
const moodSyncService = new MoodSyncService(moodStorageService);

export const useMoodCheckin = () => {
    const openMoodCheckinModal = () => {
        router.push('/(modals)/(diary)/mood');
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

    return {
        currentPeriodData,
        previousPeriodData,
        currentAvg,
        previousAvg,
        isLoading,
        error,
    };
};
