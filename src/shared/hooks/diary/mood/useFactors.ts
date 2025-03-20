import { apiClient } from '@shared/config/api-client';
import { useLanguage } from '@shared/context/language-provider';
import { initialFactorsEN } from '@shared/data/initial/factorsEN';
import { initialFactorsRU } from '@shared/data/initial/factorsRU';
import { Factor } from '@shared/types/diary/mood/MoodType';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const STALE_TIME = 5 * 60 * 1000; // 5 минут

// Хук для получения факторов
export const useFactors = () => {
    const { currentLanguage } = useLanguage();

    const initialData = useMemo(() => {
        if (currentLanguage === 'en') {
            return initialFactorsEN.sort((a, b) => a.name.localeCompare(b.name));
        }
        return initialFactorsRU.sort((a, b) => a.name.localeCompare(b.name));
    }, [currentLanguage]);

    const {
        data: factors,
        isLoading,
        error,
    } = useQuery<Factor[], Error>({
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
        initialData: initialData,
    });

    // Функция для получения фактора по его ID
    const getFactorById = (id: number): Factor | undefined => {
        return factors.find(factor => factor.id === id);
    };

    return { factors, isLoading, error, getFactorById };
};
