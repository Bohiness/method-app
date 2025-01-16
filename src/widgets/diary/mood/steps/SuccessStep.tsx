// src/widgets/diary/mood/steps/SuccessStep.tsx
import { streakService } from '@shared/lib/gamification/streak.service'
import { Emotion, Factor } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { StreakWidget } from '@widgets/gamification/streak/StreakWidget'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, {
    FadeIn,
    FadeInDown,
    SlideInRight,
    SlideOutLeft,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'

interface SuccessStepProps {
    selectedFactors: number[]
    selectedEmotions: number[]
    factors: Factor[]
    emotions: Emotion[]
    onClose?: () => void
}

export const SuccessStep: React.FC<SuccessStepProps> = ({
    selectedFactors,
    selectedEmotions,
    factors,
    emotions,
    onClose,
}) => {
    const { t } = useTranslation()

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
        <Animated.View
            className="flex-1 p-4 bg-background dark:bg-background-dark"
            entering={SlideInRight}
            exiting={SlideOutLeft}
        >
            <View className="flex-1 items-center justify-center">
                <Animated.View
                    entering={FadeInDown.delay(300)}
                    style={animatedIconStyle}
                    className="mb-6 p-6 rounded-full"
                >
                    <Icon name="CircleCheck" size={48} />
                </Animated.View>

                <Animated.View entering={FadeIn.delay(600)}>
                    <Title weight="medium" className="text-center mb-4">
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

            <View className="px-6 pb-6">
                <Button
                    variant="default"
                    className="w-full"
                    onPress={() => {
                        onClose?.()
                    }}
                >
                    {t('common.done')}
                </Button>
            </View>
        </Animated.View>
    )
}