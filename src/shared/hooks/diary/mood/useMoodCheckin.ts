// src/shared/hooks/mood/useMoodCheckin.ts
import { apiClient } from '@shared/config/api-client'
import { Emotion, Factor, MoodCheckin, MoodCheckinResponse } from '@shared/types/diary/mood/MoodType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Хук для работы с записями настроения
 * @returns Методы и данные для работы с записями настроения
 */
export const useMoodCheckin = () => {
  const queryClient = useQueryClient();

  // Получение списка эмоций
  const { data: emotions, isLoading: isLoadingEmotions } = useQuery<Emotion[]>({
    queryKey: ['emotions'],
    queryFn: async () => {
      const data = await apiClient.get<Emotion[]>('/emotions');
      return data;
    },
  });

  // Получение списка факторов
  const { data: factors, isLoading: isLoadingFactors } = useQuery<Factor[]>({
    queryKey: ['factors'],
    queryFn: async () => {
      const data = await apiClient.get<Factor[]>('/factors');
      return data;
    },
  });

  // Получение истории записей
  const { data: history, isLoading: isLoadingHistory } = useQuery<MoodCheckinResponse[]>({
    queryKey: ['mood-checkins'],
    queryFn: async () => {
      const data = await apiClient.get<MoodCheckinResponse[]>('/mood-checkins');
      return data;
    },
  });

  // Создание новой записи
  const { mutateAsync: createMoodCheckin, isPending: isCreating } = useMutation({
    mutationFn: async (data: Omit<MoodCheckin, 'id' | 'created_at'>) => {
      const response = await apiClient.post<MoodCheckinResponse>('/mood-checkins', data);
      return response;
    },
    onSuccess: () => {
      // Инвалидируем кэш истории записей после успешного создания
      queryClient.invalidateQueries({ queryKey: ['mood-checkins'] });
    },
  });

  // Получение статистики
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['mood-stats'],
    queryFn: async () => {
      const data = await apiClient.get('/mood-checkins/stats');
      return data;
    },
  });

  // Получение последней записи
  const { data: lastCheckin } = useQuery<MoodCheckinResponse>({
    queryKey: ['mood-checkins', 'last'],
    queryFn: async () => {
      const data = await apiClient.get<MoodCheckinResponse>('/mood-checkins/last');
      return data;
    },
  });

  return {
    // Данные
    emotions,
    factors,
    history,
    stats,
    lastCheckin,

    // Состояния загрузки
    isLoading: isLoadingEmotions || isLoadingFactors || isLoadingHistory || isLoadingStats,
    isCreating,

    // Методы
    createMoodCheckin,

    // Вспомогательные функции
    getEmotionsByMoodLevel: (level: number) => 
      emotions?.filter(emotion => emotion.mood_level === level) || [],
    
    getMoodLevelStats: (level: number) =>
      stats?.find(stat => stat.mood_level === level),
    
    getEmotionName: (id: number) => 
      emotions?.find(emotion => emotion.id === id)?.name,
    
    getFactorName: (id: number) => 
      factors?.find(factor => factor.id === id)?.name,
  };
};
