// src/shared/api/gamification/gamification-api.service.ts
import { apiClient } from '@shared/config/api-client'

export interface DailyProgressData {
    date: string;
    is_completed: boolean;
    tasks_completed: number;
    minutes_spent: number;
}

interface StreakStatsResponse {
    current_streak: number;
    longest_streak: number;
    total_days: number;
    last_completed_date: string | null;
    daily_progress: DailyProgressData[];
}

interface AchievementData {
    id: number;
    title: string;
    description: string;
    icon: string;
    requirement: number;
    type: 'streak' | 'tasks' | 'time' | 'special';
    current_progress: number;
    is_completed: boolean;
    completed_date: string | null;
}

interface DailyGoalData {
    id: number;
    type: 'tasks' | 'time' | 'specific_action';
    target: number;
    current: number;
    is_completed: boolean;
    last_updated: string;
}

interface StreakFreezeData {
    id: number;
    is_active: boolean;
    expires_at: string;
    total_frozen_days: number;
    remaining_days: number;
}

class GamificationApiService {
    private readonly BASE_URL = '/api/gamification';

    // Streak endpoints
    async getStreakStats(): Promise<StreakStatsResponse> {
        try {
            const response = await apiClient.get<StreakStatsResponse>(
                `${this.BASE_URL}/streaks/stats/`
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateDailyProgress(data: Partial<DailyProgressData>): Promise<DailyProgressData> {
        try {
            const response = await apiClient.post<DailyProgressData>(
                `${this.BASE_URL}/streaks/daily-progress/`,
                data
            );
            return response;
        } catch (error) {
            console.error('Failed to update daily progress:', error);
            throw error;
        }
    }

    // Achievements endpoints
    async getAchievements(): Promise<AchievementData[]> {
        try {
            const response = await apiClient.get<AchievementData[]>(
                `${this.BASE_URL}/achievements/`
            );
            return response;
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
            throw error;
        }
    }

    async getAchievementDetails(id: number): Promise<AchievementData> {
        try {
            const response = await apiClient.get<AchievementData>(
                `${this.BASE_URL}/achievements/${id}/`
            );
            return response;
        } catch (error) {
            console.error('Failed to fetch achievement details:', error);
            throw error;
        }
    }

    // Daily Goals endpoints
    async getDailyGoals(): Promise<DailyGoalData[]> {
        try {
            const response = await apiClient.get<DailyGoalData[]>(
                `${this.BASE_URL}/daily-goals/`
            );
            return response;
        } catch (error) {
            console.error('Failed to fetch daily goals:', error);
            throw error;
        }
    }

    async updateDailyGoal(id: number, data: Partial<DailyGoalData>): Promise<DailyGoalData> {
        try {
            const response = await apiClient.patch<DailyGoalData>(
                `${this.BASE_URL}/daily-goals/${id}/`,
                data
            );
            return response;
        } catch (error) {
            console.error('Failed to update daily goal:', error);
            throw error;
        }
    }

    async createDailyGoal(data: Omit<DailyGoalData, 'id'>): Promise<DailyGoalData> {
        try {
            const response = await apiClient.post<DailyGoalData>(
                `${this.BASE_URL}/daily-goals/`,
                data
            );
            return response;
        } catch (error) {
            console.error('Failed to create daily goal:', error);
            throw error;
        }
    }

    // Streak Freeze endpoints
    async getStreakFreezes(): Promise<StreakFreezeData[]> {
        try {
            const response = await apiClient.get<StreakFreezeData[]>(
                `${this.BASE_URL}/streak-freezes/`
            );
            return response;
        } catch (error) {
            console.error('Failed to fetch streak freezes:', error);
            throw error;
        }
    }

    async activateStreakFreeze(days: number): Promise<StreakFreezeData> {
        try {
            const response = await apiClient.post<StreakFreezeData>(
                `${this.BASE_URL}/streak-freezes/`,
                { total_frozen_days: days }
            );
            return response;
        } catch (error) {
            console.error('Failed to activate streak freeze:', error);
            throw error;
        }
    }
}

export const gamificationApiService = new GamificationApiService();
