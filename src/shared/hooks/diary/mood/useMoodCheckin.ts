// src/shared/hooks/mood/useMoodCheckin.ts
import { MoodSyncService } from '@shared/api/diary/MoodSyncService';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { MoodStorageService } from '@shared/lib/diary/MoodStorageService';
import { Emotion, Factor, MoodCheckin } from '@shared/types/diary/mood/MoodType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';

const moodStorageService = new MoodStorageService();
const moodSyncService = new MoodSyncService(moodStorageService);

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
            // Сохраняем в локальное хранилище
            const newCheckin = await moodStorageService.createMoodCheckin(data);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return newCheckin;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mood-checkins'] });
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
