import { streakService } from '@shared/lib/gamification/streak.service'
import { AnimatedCheck } from '@shared/ui/animated-icon/check'
import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { StreakWidget } from '@widgets/gamification/streak/StreakWidget'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
    FadeIn,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SuccessScreenProps {
    /**
     * Заголовок экрана успеха
     * @default 'diary.moodcheckin.success.title'
     */
    title: string

    /**
     * Описание экрана успеха
     * @default 'diary.moodcheckin.success.description'
     */
    description?: string

    /**
     * Флаг для активации кнопки
     * @default true
     */
    doneButtonActive?: boolean

    /**
     * Текст кнопки
     * @default 'common.done'
     */
    buttonText?: string

    /**
     * Обработчик нажатия на кнопку
     * @default router.dismissTo('/(tabs)')
     */
    onButtonPress?: () => void

    /**
     * Флаг для отображения виджета стрика
     * @default true
     */
    showStreakWidget?: boolean

    /**
     * Флаг для обновления стрика
     * @default true
     */
    updateStreak?: boolean

    /**
     * Параметры для обновления стрика
     */
    streakParams?: {
        isCompleted: boolean
        tasksCompleted: number
        minutesSpent: number
    }

    /**
     * Контент для отображения в нижней части экрана
     */
    bottomContent?: React.ReactNode
}

export function SuccessScreen({
    title,
    description,
    buttonText,
    doneButtonActive = true,
    onButtonPress,
    showStreakWidget = true,
    updateStreak = true,
    streakParams = {
        isCompleted: true,
        tasksCompleted: 1,
        minutesSpent: 1,
    },
    bottomContent
}: SuccessScreenProps) {
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
        if (updateStreak) {
            const updateStreakData = async () => {
                try {
                    await streakService.updateDailyProgress(streakParams)
                } catch (error) {
                    console.error('Error updating streak:', error)
                }
            }

            updateStreakData()
        }
    }, [updateStreak, streakParams])

    const handleClose = () => {
        if (onButtonPress) {
            onButtonPress()
        } else {
            router.dismissTo('/(tabs)')
        }
    }

    return (
        <View className="flex-1" variant="default">
            <View className="flex-1">
                <View className="flex-1 px-4">
                    <View className="flex-1 items-center justify-center">

                        <AnimatedCheck
                            size={100}
                        />

                        <Animated.View entering={FadeIn.delay(600)} className='pt-10'>
                            <Title className="text-center mb-4">
                                {title}
                            </Title>
                            {description && (
                                <Text
                                    variant="secondary"
                                    className="text-center mb-8"
                                >
                                    {description}
                                </Text>
                            )}
                        </Animated.View>

                        {showStreakWidget && (
                            <Animated.View
                                entering={FadeIn.delay(900)}
                                className="w-full mb-8"
                            >
                                <StreakWidget />
                            </Animated.View>
                        )}
                    </View>
                </View>
            </View>
            <View className="px-4 items-center">
                {bottomContent && (
                    <Animated.View
                        entering={FadeIn.delay(1200)}
                        className="w-full mb-4"
                    >
                        {bottomContent}
                    </Animated.View>
                )}
                {doneButtonActive && (
                    <Button
                        variant="default"
                        fullWidth
                        onPress={handleClose}
                        style={{ marginBottom: insets.bottom }}
                    >
                        {buttonText || t('common.done')}
                    </Button>
                )}
            </View>
        </View>
    )
}

export default SuccessScreen