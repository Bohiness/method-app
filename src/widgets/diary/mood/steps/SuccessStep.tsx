// src/widgets/diary/mood/steps/SuccessStep.tsx
import { streakService } from '@shared/lib/gamification/streak.service'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { StreakWidget } from '@widgets/gamification/streak/StreakWidget'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function SuccessStep() {
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    // Анимация для иконки
    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{
            scale: withSpring(1.2, {
                damping: 10,
                stiffness: 100,
            })
        }],
    }))

    // Обновляем streak при успешном заполнении формы
    useEffect(() => {
        const updateStreak = async () => {
            try {
                await streakService.updateDailyProgress({
                    isCompleted: true,
                    tasksCompleted: 1,
                    minutesSpent: 1,
                })
            } catch (error) {
                console.error('Error updating streak:', error)
            }
        }

        updateStreak()
    }, [])

    return (
        <View className="flex-1 px-4">
            <View className="flex-1 items-center justify-center">
                <Animated.View
                    entering={FadeInDown.delay(300)}
                    style={animatedIconStyle}
                    className="p-6 rounded-full"
                >
                    <Icon name="Check" size={60} />
                </Animated.View>

                <Animated.View entering={FadeIn.delay(600)}>
                    <Title className="text-center mb-4">
                        {t('diary.moodcheckin.success.title')}
                    </Title>
                    <Text
                        variant="secondary"
                        className="text-center mb-8"
                    >
                        {t('diary.moodcheckin.success.description')}
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeIn.delay(900)}
                    className="w-full mb-8"
                >
                    <StreakWidget />
                </Animated.View>
            </View>


        </View>
    )
}