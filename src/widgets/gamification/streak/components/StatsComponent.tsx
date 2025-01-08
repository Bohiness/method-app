// src/features/gamification/streak/ui/components/StatsComponent.tsx
import { useColorScheme } from '@shared/context/theme-provider'
import { Text } from '@shared/ui/text'
import { Calendar, Clock, Snowflake } from 'lucide-react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

interface StatsComponentProps {
    totalDays: number
    frozenDays: number
    todayMinutes: number
}

interface StatItemProps {
    icon: React.ReactNode
    label: string
    value: number
    unit?: string
}

const StatItem = ({ icon, label, value, unit }: StatItemProps) => {
    return (
        <View className="items-center">
            {icon}
            <Text variant="secondary" size="sm" className="mt-1 mb-1">
                {label}
            </Text>
            <Text size="lg" weight="bold">
                {value}{unit}
            </Text>
        </View>
    )
}

export const StatsComponent = ({
    totalDays,
    frozenDays,
    todayMinutes
}: StatsComponentProps) => {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#1A202C'
    const iconSize = 24

    return (
        <View className="flex-row justify-between">
            {/* Всего дней */}
            <StatItem
                icon={<Calendar size={iconSize} color={iconColor} />}
                label={t('streak.totalDays')}
                value={totalDays}
                unit=""
            />

            {/* Заморозка */}
            <StatItem
                icon={<Snowflake size={iconSize} color={iconColor} />}
                label={t('streak.frozenDays')}
                value={frozenDays}
                unit=""
            />

            {/* Минуты сегодня */}
            <StatItem
                icon={<Clock size={iconSize} color={iconColor} />}
                label={t('streak.todayMinutes')}
                value={todayMinutes}
                unit="м"
            />
        </View>
    )
}
