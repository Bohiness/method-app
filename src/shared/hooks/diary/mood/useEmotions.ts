import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { useLanguage } from '@shared/context/language-provider';
import { initialEmotionsEN } from '@shared/data/initial/emotionsEN';
import { initialEmotionsRU } from '@shared/data/initial/emotionsRU';
import { Emotion } from '@shared/types/diary/mood/MoodType';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const STALE_TIME = 5 * 60 * 1000; // 5 минут

// Хук для получения эмоций
export const useEmotions = () => {
    const { currentLanguage } = useLanguage();

    const initialData = useMemo(() => {
        if (currentLanguage === 'en') {
            return initialEmotionsEN.sort((a, b) => a.name.localeCompare(b.name));
        }
        return initialEmotionsRU.sort((a, b) => a.name.localeCompare(b.name));
    }, [currentLanguage]);

    return useQuery<Emotion[], Error>({
        queryKey: ['emotions'],
        queryFn: async () => {
            try {
                const emotions = await apiClient.get<Emotion[]>(API_ROUTES.DIARY.EMOTIONS);
                return emotions.sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                console.error('Failed to fetch emotions:', error);
                throw error;
            }
        },
        initialData: initialData as Emotion[],
    });
};
