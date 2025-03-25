// src/widgets/diary/mood/steps/SuccessStep.tsx
import { streakService } from '@shared/lib/gamification/streak.service'
import { AnimatedCheck } from '@shared/ui/animated-icon/check'
import { Text, Title } from '@shared/ui/text'
import { StreakWidget } from '@widgets/gamification/streak/StreakWidget'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, {
    FadeIn
} from 'react-native-reanimated'

export function SuccessStep() {
    const { t } = useTranslation()

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

                <AnimatedCheck
                    size={100}
                />

                <Animated.View entering={FadeIn.delay(600)} className='pt-10'>
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