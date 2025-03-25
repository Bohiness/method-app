import { authApiService } from '@shared/api/auth/auth-api.service'
import { useTheme } from '@shared/context/theme-provider'
import { useUser } from '@shared/context/user-provider'
import { BackgroundWithNoise } from '@shared/ui/bg/BackgroundWithNoise'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import * as Updates from 'expo-updates'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type UpdateStatus = 'checking' | 'available' | 'no-update' | 'error'
type StoreUpdateStatus = 'checking' | 'available' | 'no-update' | 'error'

interface SplashScreenProps {
    onComplete: () => void
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
    const { checkAuth } = useUser()
    const { t } = useTranslation()
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('checking')
    const [storeUpdateStatus, setStoreUpdateStatus] = useState<StoreUpdateStatus>('checking')
    const insets = useSafeAreaInsets()
    const { width: screenWidth } = useWindowDimensions()

    const { isDark } = useTheme()
    const logoSource = isDark
        ? require('@assets/images/logo/logo-white.svg')
        : require('@assets/images/logo/logo-black.svg')

    const checkForUpdates = async () => {
        if (__DEV__ || Constants.appOwnership === 'expo') {
            setUpdateStatus('no-update')
            return
        }

        try {
            setUpdateStatus('checking')
            const update = await Updates.checkForUpdateAsync()

            if (update.isAvailable) {
                setUpdateStatus('available')
                await Updates.fetchUpdateAsync()
                await Updates.reloadAsync()
            } else {
                setUpdateStatus('no-update')
            }
        } catch (error) {
            setUpdateStatus('no-update')
            console.log('Update check skipped in development mode')
        }
    }


    const initialize = async () => {
        // Главная обертка try-catch для всего процесса инициализации
        try {
            // получаем CSRF токен
            await authApiService.getCsrfToken()

            // Сначала проверяем обновления через OTA
            try {
                await checkForUpdates().catch(err => {
                    console.error('OTA update check failed:', err)
                })
            } catch (otaError) {
                console.error('Critical OTA update error:', otaError)
                // Продолжаем работу даже при критических ошибках
            }

            // Проверяем авторизацию пользователя
            try {
                await checkAuth().catch(err => {
                    console.error('Auth check failed:', err)
                })
            } catch (authError) {
                console.error('Critical auth error:', authError)
                // Продолжаем работу даже при критических ошибках авторизации
            }

            // Полностью пропускаем инициализацию subscriptionService
            // чтобы исключить возможные проблемы с нативными модулями

            // Безопасно завершаем инициализацию
            onComplete()
        } catch (error) {
            // Это критический обработчик ошибок - последняя линия защиты
            console.error('Critical initialization error:', error)

            // В любом случае завершаем загрузку сплэш-скрина и переходим к приложению
            onComplete()
        }
    }

    useEffect(() => {
        initialize()
    }, [])

    // Анимированные стили для текста
    const createTextStyle = (delay: number) => {
        return useAnimatedStyle(() => ({
            transform: [{
                translateX: withDelay(
                    delay,
                    withSpring(textProgress.value * -100 + 100)
                )
            }]
        }))
    }

    // Изменяем начальные позиции и анимацию для верхнего и нижнего логотипа
    const textProgress = useSharedValue(0)

    const logoTopX = useSharedValue(0)
    const logoBottomX = useSharedValue(-950 / 2)

    useEffect(() => {
        // Анимация текста остается прежней
        textProgress.value = withSpring(1, {
            damping: 30,
            stiffness: 200,
        })

        // Анимация верхнего логотипа - движение вправо
        logoTopX.value = withRepeat(
            withSequence(
                withTiming(-950, { duration: 15000 }),
                withTiming(screenWidth, { duration: 0 })
            ),
            -1
        )

        // Анимация нижнего логотипа - движение влево
        logoBottomX.value = withRepeat(
            withSequence(
                withTiming(screenWidth, { duration: 20000 }),
                withTiming(-screenWidth, { duration: 0 })
            ),
            -1
        )
    }, [screenWidth])

    // Анимированные стили для логотипов
    const logoTopAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{
            translateX: logoTopX.value
        }]
    }))

    const logoBottomAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{
            translateX: logoBottomX.value
        }]
    }))

    return (
        <BackgroundWithNoise className="flex-1 bg-surface-paper dark:bg-surface-paper-dark" noiseOpacity={0.3}>
            {/* Верхний текст */}
            <View variant="transparent" className="absolute px-8" style={{ right: 0, top: insets.top + 8 + 20 }}>
                <View variant="transparent" className="items-end space-y-2">
                    {[
                        { text: t('screens.splashscreen.yourgoals'), delay: 0 },
                        { text: t('screens.splashscreen.yourenergy'), delay: 500 },
                        { text: t('screens.splashscreen.yourjourney'), delay: 1000 }
                    ].map(({ text, delay }) => (
                        <Animated.View
                            key={text}
                            style={createTextStyle(delay)}
                        >
                            <Text
                                variant="secondary"
                                size="xl"
                            >
                                {text}
                            </Text>
                        </Animated.View>
                    ))}
                </View>
            </View>

            {/* Нижние логотипы */}
            <Animated.View
                style={[logoTopAnimatedStyle, { position: 'absolute', bottom: insets.bottom + 16 + 140 + 100, left: 16 }]}
            >
                <Image
                    source={logoSource}
                    style={{ height: 120, width: 900 }}
                    contentFit="contain"
                />
            </Animated.View>
            <Animated.View
                style={[logoBottomAnimatedStyle, { position: 'absolute', bottom: insets.bottom + 16 + 100, left: 16 }]}
            >
                <Image
                    source={logoSource}
                    style={{ height: 120, width: 900 }}
                    contentFit="contain"
                />
            </Animated.View>
        </BackgroundWithNoise>
    )
}