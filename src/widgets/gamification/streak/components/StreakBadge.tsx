// src/features/gamification/streak/ui/components/StreakBadge.tsx
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Text } from '@shared/ui/text'
import { Award } from 'lucide-react-native'
import React from 'react'
import { useColorScheme, View } from 'react-native'

interface StreakBadgeProps {
    days: number
    isAchieved: boolean
    onPress?: () => void
}

export const StreakBadge = ({ days, isAchieved, onPress }: StreakBadgeProps) => {
    const colorScheme = useColorScheme()

    return (
        <HapticTab onPress={onPress}>
            <View
                className={`p-3 rounded-full items-center justify-center
                    ${isAchieved
                        ? colorScheme === 'dark' ? 'bg-tint-dark' : 'bg-tint'
                        : colorScheme === 'dark' ? 'bg-surface-paper-dark' : 'bg-surface-paper'}`
                }
            >
                <Award
                    size={24}
                    color={isAchieved ? '#fff' : '#A3A3A3'}
                />
                <Text
                    size="xs"
                    className={`mt-1 ${isAchieved ? 'text-white' : ''}`}
                >
                    {days}д
                </Text>
            </View>
        </HapticTab>
    )
}
