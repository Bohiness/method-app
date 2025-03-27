import { useTheme } from '@shared/context/theme-provider'
import { logger } from '@shared/lib/logger/logger.service'
import { updateService, UpdateStatus } from '@shared/lib/update/update.service'
import { BackgroundWithNoise } from '@shared/ui/bg/BackgroundWithNoise'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, useWindowDimensions } from 'react-native'
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

interface SplashScreenProps {
    onComplete: () => void
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
    const { t } = useTranslation()
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
    const insets = useSafeAreaInsets()
    const { width: screenWidth } = useWindowDimensions()

    const { isDark } = useTheme()
    const logoSource = isDark
        ? require('@assets/images/logo/logo-white.svg')
        : require('@assets/images/logo/logo-black.svg')

    const initialize = async () => {
        // Главная обертка try-catch для всего процесса инициализации
        try {
            // Сначала проверяем обновления через OTA/Store с помощью сервиса
            // Передаем setUpdateStatus как колбэк и указываем немедленную перезагрузку
            // Ошибки логируются внутри сервиса, .catch() не нужен
            // Возвращаемое значение не используется, т.к. перезагрузка происходит внутри сервиса
            await updateService.checkForUpdates({
                reloadImmediately: true,
                onStatusChange: setUpdateStatus, // Pass the state setter function
            })

            // Если reloadImmediately=true и обновление найдено,
            // updateService.reloadApp() будет вызван, и код ниже не выполнится.
            // Если обновлений нет или reloadImmediately=false, продолжаем.

            // Безопасно завершаем инициализацию (только если не было перезагрузки)
            logger.debug('Инициализация завершена, скрываем сплэш-скрин', 'splash screen – initialize')
            onComplete()

        } catch (error) {
            // Это критический обработчик ошибок - последняя линия защиты
            // Ловим ошибки, которые могли произойти *вне* updateService.checkForUpdates
            logger.error(error, 'splash screen – initialize', 'Critical initialization error:')

            // В любом случае завершаем загрузку сплэш-скрина и переходим к приложению
            onComplete()
        }
    }

    useEffect(() => {
        initialize()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Keep dependencies empty to run only once

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

    // Function to get status text based on updateStatus
    const getStatusText = () => {
        switch (updateStatus) {
            case 'checking':
                return t('screens.splashscreen.checkingUpdates') // 'Проверка обновлений...'
            case 'downloading':
                return t('screens.splashscreen.downloadingUpdate') // 'Загрузка обновления...'
            case 'ready':
                // This state might be brief if reloadImmediately is true
                return t('screens.splashscreen.updateReady') // 'Обновление готово...'
            case 'error':
                return t('screens.splashscreen.updateError') // 'Ошибка обновления'
            case 'idle':
            default:
                return null // No text when idle or finished without error/reload
        }
    }

    const statusText = getStatusText()

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

            {/* Update Status Indicator */}
            {(updateStatus === 'checking' || updateStatus === 'downloading') && (
                <View
                    variant="transparent"
                    className="absolute bottom-0 left-0 right-0 flex-row items-center justify-center space-x-2 pb-4"
                    style={{ paddingBottom: insets.bottom + 16 }} // Position above bottom safe area
                >
                    <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
                    {statusText && (
                        <Text variant="secondary" size="sm">
                            {statusText}
                        </Text>
                    )}
                </View>
            )}
            {/* Optional: Show error message differently if needed */}
            {/* {updateStatus === 'error' && statusText && (
                <View
                    variant="transparent"
                    className="absolute bottom-0 left-0 right-0 items-center justify-center pb-4"
                    style={{ paddingBottom: insets.bottom + 16 }}
                >
                    <Text variant="error" size="sm">
                        {statusText}
                    </Text>
                </View>
            )} */}
        </BackgroundWithNoise>
    )
}