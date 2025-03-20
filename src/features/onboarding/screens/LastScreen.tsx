import { dailyNotificationsService } from '@shared/lib/notifications/daily-notifications.service'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, PanResponder } from 'react-native'
import Animated, {
    FadeIn,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated'
import { useOnboarding } from '../context/OnboardingContext'

export const LastScreen = () => {
    const { t } = useTranslation()
    const { completeOnboarding } = useOnboarding()
    const translateY = useSharedValue(0)
    const screenTranslateY = useSharedValue(0)
    const { height } = Dimensions.get('window')

    useEffect(() => {
        dailyNotificationsService.scheduleAllDailyNotifications()
    }, [])

    // Анимация для иконки свайпа
    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 1000 }),
                withTiming(0, { duration: 1000 })
            ),
            -1,
            true
        )
    }, [])

    const handleComplete = () => {
        // Анимируем экран вверх перед завершением
        screenTranslateY.value = withTiming(-height, {
            duration: 300
        }, () => {
            runOnJS(completeOnboarding)()
        })
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, { dy }) => {
            return Math.abs(dy) > 5
        },
        onPanResponderMove: (_, { dy }) => {
            // Ограничиваем движение только вверх
            if (dy < 0) {
                screenTranslateY.value = dy
            }
        },
        onPanResponderRelease: (_, { dy, vy }) => {
            if (dy < -100 || vy < -0.5) {
                // Если свайп достаточно сильный - завершаем
                handleComplete()
            } else {
                // Возвращаем на место
                screenTranslateY.value = withSpring(0)
            }
        },
    })

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }))

    const animatedScreenStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: screenTranslateY.value }]
    }))

    return (
        <Animated.View
            style={animatedScreenStyle}
            className="flex-1 bg-white dark:bg-black"
            {...panResponder.panHandlers}
        >
            {/* Основной контент */}
            <Animated.View
                className="flex-1 items-center justify-center px-6"
                entering={FadeIn.duration(800)}
            >
                <Title
                    size="3xl"
                    weight="bold"
                    className="text-center mb-4"
                >
                    {t('screens.onboarding.last.title')}
                </Title>

                <Text
                    size="lg"
                    variant="secondary"
                    className="text-center mb-2"
                >
                    {t('screens.onboarding.last.subtitle')}
                </Text>
            </Animated.View>

            {/* Анимированный свайп */}
            <Animated.View
                style={animatedIconStyle}
                className="items-center absolute bottom-12 left-0 right-0"
            >
                <Icon name='ChevronUp' size={40} className="text-secondary mb-2" />
                <Text
                    variant="secondary"
                    size="sm"
                    className="text-center"
                >
                    {t('common.swipe')}
                </Text>
            </Animated.View>
        </Animated.View>
    )
}