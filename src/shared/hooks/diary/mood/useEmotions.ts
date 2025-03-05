import { apiClient } from '@shared/config/api-client';
import { initialEmotionsEN } from '@shared/data/initial/emotions';
import { Emotion } from '@shared/types/diary/mood/MoodType';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 минут

// Хук для получения эмоций
export const useEmotions = () => {
    return useQuery<Emotion[], Error>({
        queryKey: ['emotions'],
        queryFn: async () => {
            try {
                const emotions = await apiClient.get<Emotion[]>('/api/emotions/');
                return emotions.sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                console.error('Failed to fetch emotions:', error);
                throw error;
            }
        },
        initialData: initialEmotionsEN.sort((a, b) => a.name.localeCompare(b.name)),
        staleTime: 0, // Устанавливаем staleTime в 0, чтобы данные всегда считались устаревшими
        gcTime: 0, // Отключаем сборку мусора кэша (раньше назывался cacheTime)
    });
};
