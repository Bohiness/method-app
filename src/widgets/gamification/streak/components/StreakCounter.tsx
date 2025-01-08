// src/features/gamification/streak/ui/components/StreakCounter.tsx
import { Text } from '@shared/ui/text'
import { Shield } from 'lucide-react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useColorScheme, View } from 'react-native'

interface StreakCounterProps {
    current: number
    record: number
}

export const StreakCounter = ({ current, record }: StreakCounterProps) => {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()

    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
                <Shield size={24} className={colorScheme === 'dark' ? 'text-tint-dark' : 'text-tint'} />
                <Text size="xl" weight="bold" className="ml-2">
                    {t('streak.currentStreak', { count: current })}
                </Text>
            </View>
            <Text variant="secondary">
                {t('streak.record', { count: record })}
            </Text>
        </View>
    )
}
