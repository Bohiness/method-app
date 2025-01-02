// src/shared/types/gamification/StreakTypes.ts

export interface DailyProgress {
    date: string;
    isCompleted: boolean;
    tasksCompleted: number;
    minutesSpent: number;
}

export interface StreakStats {
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    lastCompletedDate: string;
    frozenDaysLeft: number;
    dailyProgress: DailyProgress[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    requirement: number;
    currentProgress: number;
    isCompleted: boolean;
    completedDate?: string;
    type: 'streak' | 'tasks' | 'time' | 'special';
}

export interface DailyGoal {
    id: string;
    type: 'tasks' | 'time' | 'specific_action';
    target: number;
    current: number;
    isCompleted: boolean;
    lastUpdated: string;
}

export interface StreakFreeze {
    isActive: boolean;
    expiresAt: string;
    totalFrozenDays: number;
    remainingDays: number;
}

