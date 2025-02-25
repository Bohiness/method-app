import { apiClient } from '@shared/config/api-client';
import { initialFactorsEN } from '@shared/data/initial/factors';
import { Factor } from '@shared/types/diary/mood/MoodType';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 минут

// Хук для получения факторов
export const useFactors = () => {
    return useQuery<Factor[], Error>({
        queryKey: ['factors'],
        queryFn: async () => {
            try {
                const factors = await apiClient.get<Factor[]>('/api/factors/');
                return factors.sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                console.error('Failed to fetch factors:', error);
                throw error;
            }
        },
        initialData: initialFactorsEN.sort((a, b) => a.name.localeCompare(b.name)),
    });
};
