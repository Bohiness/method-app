// src/features/gamification/streak/ui/StreakWidget.tsx
import { useColorScheme } from '@shared/context/theme-provider'
import { streakService } from '@shared/lib/gamification/streak.service'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { DailyProgress, StreakStats } from '@shared/types/gamification/StreakTypes'
import { Text } from '@shared/ui/text'
import { addDays, format, startOfWeek } from 'date-fns'
import { Calendar, Shield } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const StreakWidget = () => {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const [stats, setStats] = useState<StreakStats | null>(null)
    const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([])

    useEffect(() => {
        loadStreakData()
    }, [])

    const loadStreakData = async () => {
        const streakStats = await streakService.getStreakStats()
        setStats(stats)
        generateWeekProgress(streakStats.dailyProgress)
    }

    const generateWeekProgress = (progress: DailyProgress[]) => {
        const startDate = startOfWeek(new Date())
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const date = format(addDays(startDate, i), 'yyyy-MM-dd')
            return (
                progress.find(p => p.date === date) || {
                    date,
                    isCompleted: false,
                    tasksCompleted: 0,
                    minutesSpent: 0
                }
            )
        })
        setWeekProgress(weekDays)
    }

    if (!stats) return null

    return (
        <View className={`p-4 rounded-2xl ${colorScheme === 'dark' ? 'bg-surface-paper-dark' : 'bg-surface-paper'}`}>
            {/* Заголовок */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <Shield size={24} className={colorScheme === 'dark' ? 'text-tint-dark' : 'text-tint'} />
                    <Text size="xl" weight="bold" className="ml-2">
                        {t('streak.currentStreak', { count: stats.currentStreak })}
                    </Text>
                </View>
                <Text variant="secondary">
                    {t('streak.record', { count: stats.longestStreak })}
                </Text>
            </View>

            {/* Календарь недели */}
            <View className="flex-row justify-between mb-4">
                {weekProgress.map((day, index) => (
                    <HapticTab key={day.date}>
                        <View className="items-center">
                            <Text size="sm" variant="secondary">
                                {format(new Date(day.date), 'E')}
                            </Text>
                            <View
                                className={`w-8 h-8 rounded-full items-center justify-center mt-1
                                    ${day.isCompleted
                                        ? colorScheme === 'dark' ? 'bg-tint-dark' : 'bg-tint'
                                        : colorScheme === 'dark' ? 'bg-surface-paper-dark' : 'bg-surface-paper'}`
                                }
                            >
                                <Calendar size={16} color={day.isCompleted ? '#fff' : '#A3A3A3'} />
                            </View>
                        </View>
                    </HapticTab>
                ))}
            </View>

            {/* Статистика */}
            <View className="flex-row justify-between">
                <View className="items-center">
                    <Text variant="secondary" size="sm">{t('streak.totalDays')}</Text>
                    <Text size="lg" weight="bold">{stats.totalDays}</Text>
                </View>
                <View className="items-center">
                    <Text variant="secondary" size="sm">{t('streak.frozenDays')}</Text>
                    <Text size="lg" weight="bold">{stats.frozenDaysLeft}</Text>
                </View>
                <View className="items-center">
                    <Text variant="secondary" size="sm">{t('streak.todayMinutes')}</Text>
                    <Text size="lg" weight="bold">
                        {weekProgress[6]?.minutesSpent || 0}
                    </Text>
                </View>
            </View>
        </View>
    )
}
