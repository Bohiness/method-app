// src/shared/hooks/mood/useMoodCheckins.ts
import { apiClient } from '@shared/config/api-client'
import { initialEmotionsEN } from '@shared/data/initial/emotions'
import { initialFactorsEN } from '@shared/data/initial/factors'
import { useOfflineMutation } from '@shared/hooks/useOfflineQuery'
import { Emotion, Factor, MoodCheckin } from '@shared/types/diary/mood/MoodType'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const STALE_TIME = 5 * 60 * 1000; // 5 минут

// Хук для получения эмоций
export const useEmotions = () => {
  return useQuery<Emotion[], Error>({
    queryKey: ['emotions'],
    queryFn: async () => {
      try {
        return await apiClient.get<Emotion[]>('/api/emotions/');
      } catch (error) {
        console.error('Failed to fetch emotions:', error);
        throw error;
      }
    },
    staleTime: STALE_TIME,
    retry: 3,
    initialData: initialEmotionsEN
  });
};

// Хук для получения факторов
export const useFactors = () => {
  return useQuery<Factor[], Error>({
    queryKey: ['factors'],
    queryFn: async () => {
      try {
        return await apiClient.get<Factor[]>('/api/factors/');
      } catch (error) {
        console.error('Failed to fetch factors:', error);
        throw error;
      }
    },
    staleTime: STALE_TIME,
    retry: 3,
    initialData: initialFactorsEN
  });
};

// Хук для работы с историей записей
export const useMoodHistory = () => {
  return useQuery<MoodCheckin[], Error>({
    queryKey: ['mood-checkins'],
    queryFn: async () => {
      try {
        return await apiClient.get<MoodCheckin[]>('/api/mood-checkins/');
      } catch (error) {
        console.error('Failed to fetch mood checkins:', error);
        throw error;
      }
    },
    staleTime: STALE_TIME,
  });
};

// Хук для получения статистики
export const useMoodStats = () => {
  return useQuery({
    queryKey: ['mood-stats'],
    queryFn: async () => {
      try {
        return await apiClient.get('/api/mood-checkins/stats/');
      } catch (error) {
        console.error('Failed to fetch mood stats:', error);
        throw error;
      }
    },
    staleTime: STALE_TIME,
  });
};

// Хук для получения последней записи
export const useLastMoodCheckin = () => {
  return useQuery<MoodCheckin, Error>({
    queryKey: ['mood-checkins', 'last'],
    queryFn: async () => {
      try {
        return await apiClient.get<MoodCheckin>('/api/mood-checkins/last/');
      } catch (error) {
        console.error('Failed to fetch last checkin:', error);
        throw error;
      }
    },
    staleTime: STALE_TIME,
  });
};

// Хук для создания новой записи
export const useCreateMoodCheckin = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation<Omit<MoodCheckin, 'id' | 'created_at'>>(
    'mood-checkins',
    (data) => apiClient.post<MoodCheckin>('/api/mood-checkins/', data),
  );
};

// Вспомогательные функции
export const moodHelpers = {
  getEmotionsByMoodLevel: (emotions: Emotion[] | undefined, level: number) => 
    emotions?.filter(emotion => emotion.mood_level === level) || [],
  
  getMoodLevelStats: (stats: any[] | undefined, level: number) =>
    stats?.find(stat => stat.mood_level === level),
  
  getEmotionName: (emotions: Emotion[] | undefined, id: number) => 
    emotions?.find(emotion => emotion.id === id)?.name,
  
  getFactorName: (factors: Factor[] | undefined, id: number) => 
    factors?.find(factor => factor.id === id)?.name,
};