import { apiClient } from '@shared/config/api-client';
import { MonthlyStatsResponse, ProcessedMoodStats, WeeklyStatsResponse } from '@shared/types/diary/stats/statsType';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useMoodStats = (): ProcessedMoodStats => {
    const { data: monthlyData, isPending: isMonthlyPending } = useQuery<MonthlyStatsResponse>({
        queryKey: ['mood-stats', 'monthly'],
        queryFn: () => apiClient.get('/api/mood-checkins/monthly_stats/'),
    });

    const { data: weeklyData, isPending: isWeeklyPending } = useQuery<WeeklyStatsResponse>({
        queryKey: ['mood-stats', 'weekly'],
        queryFn: () => apiClient.get('/api/mood-checkins/weekly_stats/'),
    });

    return useMemo(() => {
        const processDataArray = (data: Array<{ date: string; avg_mood: number; count: number }>) => {
            return data.map(item => ({
                date: new Date(item.date),
                value: item.avg_mood,
                count: item.count,
            }));
        };

        return {
            monthlyData: {
                current: processDataArray(monthlyData?.current_month || []),
                previous: processDataArray(monthlyData?.previous_month || []),
                currentAvg: monthlyData?.current_month_avg || 0,
                previousAvg: monthlyData?.previous_month_avg || 0,
            },
            weeklyData: {
                current: processDataArray(weeklyData?.current_week || []),
                previous: processDataArray(weeklyData?.previous_week || []),
                currentAvg: weeklyData?.current_week_avg || 0,
                previousAvg: weeklyData?.previous_week_avg || 0,
            },
            rawData: {
                monthly: monthlyData,
                weekly: weeklyData,
            },
            isPending: isMonthlyPending || isWeeklyPending,
        };
    }, [monthlyData, weeklyData, isMonthlyPending, isWeeklyPending]);
};
