// src/features/gamification/streak/ui/StreakContainer.tsx
import { useColorScheme } from '@shared/context/theme-provider'
import { useAchievements, useDailyGoals, useDailyProgress, useStreakStats } from '@shared/hooks/gamification/useGamification'
import { DailyProgress, StreakStats } from '@shared/types/gamification/StreakTypes'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { DayProgress } from './components/DayProgress'
import { StatsComponent } from './components/StatsComponent'
import { StreakBadge } from './components/StreakBadge'
import { StreakCounter } from './components/StreakCounter'
import { StreakProgress } from './components/StreakProgress'

const STREAK_ACHIEVEMENTS = [7, 30, 100, 365]

export const StreakContainer = () => {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()

    // React Query хуки
    const {
        streakData,
        refetchStreak
    } = useStreakStats()

    const { mutate: updateProgress, isPending: isUpdating } = useDailyProgress()
    const { data: achievements } = useAchievements()
    const { data: dailyGoals } = useDailyGoals()

    // Локальное состояние
    const [stats, setStats] = useState<StreakStats | null>(null)
    const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([])
    const [todayProgress, setTodayProgress] = useState({ current: 0, target: 5 })
    const [refreshing, setRefreshing] = useState(false)

    // Обработчик обновления данных при pull-to-refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        try {
            await refetchStreak()
        } finally {
            setRefreshing(false)
        }
    }, [refetchStreak])

    // Обновление прогресса за день
    const handleUpdateProgress = useCallback(async (minutes: number) => {
        const today = new Date().toISOString().split('T')[0]

        updateProgress({
            date: today,
            is_completed: minutes >= 30, // Пример условия выполнения
            tasks_completed: todayProgress.current + 1,
            minutes_spent: minutes
        }, {
            onSuccess: () => {
                refetchStreak() // Обновляем данные после успешного обновления
            }
        })
    }, [updateProgress, todayProgress.current, refetchStreak])

    // Обработка данных с сервера
    useEffect(() => {
        if (streakData) {
            setStats({
                currentStreak: streakData.current_streak,
                longestStreak: streakData.longest_streak,
                totalDays: streakData.total_days,
                lastCompletedDate: streakData.last_completed_date || '',
                frozenDaysLeft: 0,
                dailyProgress: streakData.daily_progress.map(p => ({
                    date: p.date,
                    isCompleted: p.is_completed,
                    tasksCompleted: p.tasks_completed,
                    minutesSpent: p.minutes_spent
                }))
            })

            // Генерируем прогресс за неделю
            generateWeekProgress(streakData?.daily_progress)

            // Обновляем прогресс за сегодня
            const today = new Date().toISOString().split('T')[0]
            const todayData = streakData.daily_progress.find(p => p.date === today)
            if (todayData) {
                setTodayProgress(prev => ({
                    ...prev,
                    current: todayData.tasks_completed
                }))
            }
        }
    }, [streakData])

    const generateWeekProgress = useCallback((progress: DailyProgress[]) => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 6)

        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]

            return progress.find(p => p.date === dateStr) || {
                date: dateStr,
                isCompleted: false,
                tasksCompleted: 0,
                minutesSpent: 0
            }
        })

        setWeekProgress(weekDays)
    }, [])

    if (!stats) return null

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            <View className={`p-4 rounded-2xl ${colorScheme === 'dark' ? 'bg-surface-paper-dark' : 'bg-surface-paper'}`}>
                {/* Счетчик серии */}
                <StreakCounter
                    current={stats.currentStreak}
                    record={stats.longestStreak}
                />

                {/* Прогресс дня */}
                <StreakProgress
                    current={todayProgress.current}
                    target={todayProgress.target}
                    onUpdate={handleUpdateProgress}
                    isUpdating={isUpdating}
                />

                {/* Календарь недели */}
                <View className="flex-row justify-between my-6">
                    {weekProgress.map((day) => (
                        <DayProgress
                            key={day.date}
                            date={day.date}
                            isCompleted={day.isCompleted}
                            tasksCompleted={day.tasksCompleted}
                        />
                    ))}
                </View>

                {/* Значки достижений */}
                <View className="flex-row justify-around mb-6">
                    {STREAK_ACHIEVEMENTS.map((days) => (
                        <StreakBadge
                            key={days}
                            days={days}
                            isAchieved={stats.currentStreak >= days}
                            onPress={() => {
                                // Показать детали достижения
                            }}
                        />
                    ))}
                </View>

                {/* Статистика */}
                <StatsComponent
                    totalDays={stats.totalDays}
                    frozenDays={stats.frozenDaysLeft}
                    todayMinutes={weekProgress[6]?.minutesSpent || 0}
                />
            </View>
        </ScrollView>
    )
}