// src/features/gamification/streak/ui/components/StreakProgress.tsx
import { Text } from '@shared/ui/text'
import React from 'react'
import { View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'

interface StreakProgressProps {
    current: number
    target: number
}

export const StreakProgress = ({ current, target }: StreakProgressProps) => {
    const progress = Math.min(current / target, 1)

    const animatedStyle = useAnimatedStyle(() => ({
        width: withSpring(`${progress * 100}%`, {
            damping: 15,
            stiffness: 120
        })
    }))

    return (
        <View className="mt-4">
            <View className="flex-row justify-between mb-2">
                <Text size="sm" variant="secondary">
                    Прогресс дня
                </Text>
                <Text size="sm" variant="secondary">
                    {current}/{target}
                </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <Animated.View
                    className="h-full bg-tint rounded-full"
                    style={animatedStyle}
                />
            </View>
        </View>
    )
}
