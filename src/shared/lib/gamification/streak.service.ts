// src/shared/lib/gamification/streak.service.ts

import { storage } from '@shared/lib/storage/storage.service'
import { DailyProgress, StreakFreeze, StreakStats } from '@shared/types/gamification/StreakTypes'
import { differenceInDays, format } from 'date-fns'

class StreakService {
    private readonly STREAK_KEY = 'user-streak';
    private readonly FREEZE_KEY = 'streak-freeze';
    
    async getStreakStats(): Promise<StreakStats> {
        const stats = await storage.get<StreakStats>(this.STREAK_KEY);
        if (!stats) {
            return this.initializeStreakStats();
        }
        return stats;
    }

    async updateDailyProgress(progress: Partial<DailyProgress>): Promise<StreakStats> {
        const stats = await this.getStreakStats();
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const todayProgress = stats.dailyProgress.find(p => p.date === today);
        if (todayProgress) {
            Object.assign(todayProgress, progress);
        } else {
            stats.dailyProgress.push({
                date: today,
                isCompleted: false,
                tasksCompleted: 0,
                minutesSpent: 0,
                ...progress
            });
        }

        // Обновляем streak если задание выполнено
        if (progress.isCompleted) {
            const lastDate = stats.lastCompletedDate;
            const daysDiff = differenceInDays(new Date(), new Date(lastDate));
            
            // Проверяем использование заморозки
            const freeze = await this.getStreakFreeze();
            const canUseFreeze = freeze.isActive && freeze.remainingDays > 0;

            if (daysDiff <= 1 || (daysDiff === 2 && canUseFreeze)) {
                stats.currentStreak += 1;
                if (canUseFreeze && daysDiff === 2) {
                    await this.useStreakFreeze();
                }
            } else {
                stats.currentStreak = 1;
            }

            stats.lastCompletedDate = today;
            stats.totalDays += 1;
            stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        }

        await storage.set(this.STREAK_KEY, stats);
        return stats;
    }

    private async initializeStreakStats(): Promise<StreakStats> {
        const today = format(new Date(), 'yyyy-MM-dd');
        const initialStats: StreakStats = {
            currentStreak: 0,
            longestStreak: 0,
            totalDays: 0,
            lastCompletedDate: today,
            frozenDaysLeft: 0,
            dailyProgress: []
        };
        await storage.set(this.STREAK_KEY, initialStats);
        return initialStats;
    }

    async getStreakFreeze(): Promise<StreakFreeze> {
        const freeze = await storage.get<StreakFreeze>(this.FREEZE_KEY);
        if (!freeze) {
            return {
                isActive: false,
                expiresAt: '',
                totalFrozenDays: 0,
                remainingDays: 0
            };
        }
        return freeze;
    }

    private async useStreakFreeze(): Promise<void> {
        const freeze = await this.getStreakFreeze();
        if (freeze.isActive && freeze.remainingDays > 0) {
            freeze.remainingDays -= 1;
            await storage.set(this.FREEZE_KEY, freeze);
        }
    }

    async activateStreakFreeze(days: number): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const freeze: StreakFreeze = {
            isActive: true,
            expiresAt: format(expiresAt, 'yyyy-MM-dd'),
            totalFrozenDays: days,
            remainingDays: days
        };

        await storage.set(this.FREEZE_KEY, freeze);
    }
}

export const streakService = new StreakService();
