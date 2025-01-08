// src/features/gamification/streak/ui/components/StreakStats.tsx
import { Text } from '@shared/ui/text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

interface StreakStatsProps {
    totalDays: number
    frozenDays: number
    todayMinutes: number
}

export const StreakStats = ({ totalDays, frozenDays, todayMinutes }: StreakStatsProps) => {
    const { t } = useTranslation()

    return (
        <View className="flex-row justify-between">
            <StatItem
                label={t('streak.totalDays')}
                value={totalDays}
            />
            <StatItem
                label={t('streak.frozenDays')}
                value={frozenDays}
            />
            <StatItem
                label={t('streak.todayMinutes')}
                value={todayMinutes}
            />
        </View>
    )
}

const StatItem = ({ label, value }: { label: string; value: number }) => (
    <View className="items-center">
        <Text variant="secondary" size="sm">{label}</Text>
        <Text size="lg" weight="bold">{value}</Text>
    </View>
)
