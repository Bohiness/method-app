// src/shared/hooks/mood/useMoodCheckins.ts
import { apiClient } from '@shared/config/api-client'
import { initialEmotionsEN } from '@shared/data/initial/emotions'
import { initialFactorsEN } from '@shared/data/initial/factors'
import { useOfflineMutation } from '@shared/hooks/useOfflineQuery'
import { Emotion, Factor, MoodCheckin } from '@shared/types/diary/mood/MoodType'
import { MonthlyStatsResponse, ProcessedMoodStats, WeeklyStatsResponse } from '@shared/types/diary/stats/statsType'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

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

export const useMoodStats = (): ProcessedMoodStats => {
  const { data: monthlyData, isPending: isMonthlyPending } = useQuery<MonthlyStatsResponse>({
    queryKey: ['mood-stats', 'monthly'],
    queryFn: () => apiClient.get('/api/mood-checkins/monthly_stats/')
  });

  const { data: weeklyData, isPending: isWeeklyPending } = useQuery<WeeklyStatsResponse>({
    queryKey: ['mood-stats', 'weekly'],
    queryFn: () => apiClient.get('/api/mood-checkins/weekly_stats/')
  });

  const processedData = useMemo(() => {
    const processDataArray = (data: Array<{ date: string; avg_mood: number; count: number }>) => {
      return data.map(item => ({
        date: new Date(item.date),
        value: item.avg_mood,
        count: item.count
      }));
    };

    return {
      monthlyData: {
        current: processDataArray(monthlyData?.current_month || []),
        previous: processDataArray(monthlyData?.previous_month || []),
        currentAvg: monthlyData?.current_month_avg || 0,
        previousAvg: monthlyData?.previous_month_avg || 0
      },
      weeklyData: {
        current: processDataArray(weeklyData?.current_week || []),
        previous: processDataArray(weeklyData?.previous_week || []),
        currentAvg: weeklyData?.current_week_avg || 0,
        previousAvg: weeklyData?.previous_week_avg || 0
      },
      rawData: {
        monthly: monthlyData,
        weekly: weeklyData
      },
      isPending: isMonthlyPending || isWeeklyPending
    };
  }, [monthlyData, weeklyData]);

  return processedData;
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
    async (data) => {
      const response = await apiClient.post<MoodCheckin>('/api/mood-checkins/', data);
      queryClient.invalidateQueries({ queryKey: ['mood-stats', 'monthly'] });
      return response;
    }
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