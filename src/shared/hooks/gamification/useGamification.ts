// src/shared/api/gamification/hooks/useGamification.ts
import { DailyProgressData, gamificationApiService } from '@shared/api/gamification/gamification-api.service';
import { useUser } from '@shared/context/user-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
// Получение статистики
const { data: streakStats, isLoading } = useStreakStats();

// Обновление прогресса
const { mutate: updateProgress } = useDailyProgress();
updateProgress({
    date: format(new Date(), 'yyyy-MM-dd'),
    is_completed: true,
    tasks_completed: 5,
    minutes_spent: 30
});

// Работа с достижениями
const { data: achievements } = useAchievements();

// Управление ежедневными целями
const { data: dailyGoals } = useDailyGoals();
const { mutate: updateGoal } = useUpdateDailyGoal();
updateGoal({
    id: goalId,
    data: { current: newValue, is_completed: true }
});

// Активация заморозки
const { mutate: activateFreeze } = useActivateStreakFreeze();
activateFreeze(5); // 5 дней заморозки
 */
const GAMIFICATION_KEYS = {
    streak: ['gamification', 'streak'],
    achievements: ['gamification', 'achievements'],
    dailyGoals: ['gamification', 'daily-goals'],
    streakFreeze: ['gamification', 'streak-freeze'],
};

export const useStreakStats = () => {
    const isAuthenticated = useUser();

    const response = useQuery({
        queryKey: GAMIFICATION_KEYS.streak,
        queryFn: () => gamificationApiService.getStreakStats(),
        staleTime: 1000 * 60 * 5, // 5 минут
        enabled: !!isAuthenticated,
    });

    return {
        streakData: response.data,
        current_streak: response.data?.current_streak,
        longest_streak: response.data?.longest_streak,
        total_days: response.data?.total_days,
        last_completed_date: response.data?.last_completed_date,
        daily_progress: response.data?.daily_progress,
        refetchStreak: response.refetch,
    };
};

export const useDailyProgress = () => {
    const queryClient = useQueryClient();

    return useMutation<DailyProgressData, Error, Partial<DailyProgressData>>({
        mutationFn: data => gamificationApiService.updateDailyProgress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.streak });
        },
    });
};

export const useAchievements = () => {
    return useQuery({
        queryKey: GAMIFICATION_KEYS.achievements,
        queryFn: () => gamificationApiService.getAchievements(),
        staleTime: 1000 * 60 * 15, // 15 минут
    });
};

export const useAchievementDetails = (id: number) => {
    return useQuery({
        queryKey: [...GAMIFICATION_KEYS.achievements, id],
        queryFn: () => gamificationApiService.getAchievementDetails(id),
        enabled: !!id,
    });
};

export const useDailyGoals = () => {
    return useQuery({
        queryKey: GAMIFICATION_KEYS.dailyGoals,
        queryFn: () => gamificationApiService.getDailyGoals(),
        staleTime: 1000 * 60 * 5, // 5 минут
    });
};

export const useUpdateDailyGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Parameters<typeof gamificationApiService.updateDailyGoal>[1];
        }) => gamificationApiService.updateDailyGoal(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.dailyGoals });
        },
    });
};

export const useCreateDailyGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: gamificationApiService.createDailyGoal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.dailyGoals });
        },
    });
};

export const useStreakFreezes = () => {
    return useQuery({
        queryKey: GAMIFICATION_KEYS.streakFreeze,
        queryFn: () => gamificationApiService.getStreakFreezes(),
    });
};

export const useActivateStreakFreeze = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: gamificationApiService.activateStreakFreeze,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.streakFreeze });
            queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.streak });
        },
    });
};
