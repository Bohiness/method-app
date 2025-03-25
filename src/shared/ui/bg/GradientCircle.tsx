import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    SharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated'

// Обертка для LinearGradient с поддержкой анимированных свойств
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export const GradientCircle = (
    {
        gradient,
        size,
        rotationValue,
        intensity = 1.2,
        showGlowingDots = true,
    }: {
        gradient: string[]
        size: number
        rotationValue: SharedValue<number>
        intensity?: number
        showGlowingDots?: boolean
    }
) => {
    // Упрощенные анимированные значения
    const pulseValue = useSharedValue(1)
    const blobScale1 = useSharedValue(0.9)
    const blobOpacity1 = useSharedValue(0.1)

    // Позиции световых пятен для анимации движения
    const blob1PosX = useSharedValue(65)
    const blob1PosY = useSharedValue(25)

    // Анимированные значения для градиентов
    const gradientPos1X = useSharedValue(0)
    const gradientPos1Y = useSharedValue(0)
    const gradientPos2X = useSharedValue(1)
    const gradientPos2Y = useSharedValue(1)

    const gradientTilt1 = useSharedValue(0)
    const gradientScale1 = useSharedValue(1)

    // Добавление белого цвета и двух слоев градиента
    const primaryColor = gradient[0] || '#ff5500'
    const secondaryColor = gradient[1] || '#3366ff'
    const whiteColor = '#ffffff'

    // Два разных набора цветов для слоев градиента
    const gradientLayer1: [string, string, string] = [whiteColor, primaryColor, 'transparent']
    const gradientLayer2: [string, string, string] = [secondaryColor, 'transparent', whiteColor]

    // Упрощенная функция создания движения
    const createSimpleMovement = (
        positionX: SharedValue<number>,
        positionY: SharedValue<number>,
        startPositionX: number,
        startPositionY: number
    ) => {
        // Начальные значения
        positionX.value = startPositionX
        positionY.value = startPositionY

        // Простая анимация по X
        positionX.value = withRepeat(
            withSequence(
                withTiming(30, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
                withTiming(70, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )

        // Простая анимация по Y
        positionY.value = withRepeat(
            withSequence(
                withTiming(60, { duration: 3500, easing: Easing.inOut(Easing.cubic) }),
                withTiming(20, { duration: 3500, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )
    }

    useEffect(() => {
        // Пульсирующая анимация для градиента
        pulseValue.value = withRepeat(
            withTiming(intensity, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        )

        // Анимация для светящихся пятен
        blobScale1.value = withRepeat(
            withTiming(1.3, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        )

        blobOpacity1.value = withRepeat(
            withTiming(0.8, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        )

        // Запускаем простое движение светового пятна
        createSimpleMovement(blob1PosX, blob1PosY, 65, 25)

        // Упрощенные анимации для градиентов
        gradientPos1X.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.cubic) }),
                withTiming(0.1, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )

        gradientPos1Y.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 3200, easing: Easing.inOut(Easing.cubic) }),
                withTiming(0.5, { duration: 2800, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )

        gradientPos2X.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 3800, easing: Easing.inOut(Easing.cubic) }),
                withTiming(1.2, { duration: 2700, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )

        gradientPos2Y.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 2900, easing: Easing.inOut(Easing.cubic) }),
                withTiming(1.3, { duration: 3300, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )

        // Упрощенная анимация наклона градиента
        gradientTilt1.value = withRepeat(
            withSequence(
                withTiming(15, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
                withTiming(-10, { duration: 4500, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )

        // Упрощенная анимация масштаба градиента
        gradientScale1.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
                withTiming(0.9, { duration: 3500, easing: Easing.inOut(Easing.cubic) }),
            ),
            -1,
            true
        )
    }, [])

    // Анимированный стиль для основного контейнера
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: whiteColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 8,
            transform: [
                { rotate: `${rotationValue.value}deg` },
                { scale: pulseValue.value }
            ],
            overflow: 'hidden',
        }
    })

    // Анимированные стили для слоев градиента
    const gradientLayer1Style = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            width: '110%',
            height: '110%',
            top: '-10%',
            left: '-10%',
            opacity: 0.85,
            transform: [
                { rotate: `${gradientTilt1.value}deg` },
                { scale: gradientScale1.value }
            ],
        }
    })

    const gradientLayer2Style = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            width: '110%',
            height: '110%',
            top: '-10%',
            left: '-10%',
            opacity: 0.7,
            transform: [
                { rotate: `${-gradientTilt1.value}deg` },
                { scale: gradientScale1.value }
            ],
        }
    })

    // Анимированные пропсы для градиентов
    const gradientProps1 = useAnimatedProps(() => {
        return {
            start: { x: gradientPos1X.value, y: gradientPos1Y.value },
            end: { x: gradientPos2X.value, y: gradientPos2Y.value }
        }
    })

    const gradientProps2 = useAnimatedProps(() => {
        return {
            start: { x: gradientPos2X.value, y: gradientPos1Y.value },
            end: { x: gradientPos1X.value, y: gradientPos2Y.value }
        }
    })

    // Стиль для светящегося пятна
    const blob1Style = useAnimatedStyle(() => ({
        width: size * 0.25,
        height: size * 0.2,
        position: 'absolute',
        left: `${blob1PosX.value}%`,
        top: `${blob1PosY.value}%`,
        shadowColor: whiteColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
        transform: [
            { scale: blobScale1.value },
            { rotate: `${blobScale1.value * 30}deg` }
        ],
        opacity: blobOpacity1.value,
    }))

    const blobBorderRadius = Math.min(size * 0.1, 40)

    return (
        <Animated.View style={[animatedStyle]}>
            {/* Упрощенные слои градиента */}
            <Animated.View style={gradientLayer1Style}>
                <AnimatedLinearGradient
                    colors={gradientLayer1}
                    animatedProps={gradientProps1}
                    style={styles.fullSize}
                />
            </Animated.View>

            <Animated.View style={gradientLayer2Style}>
                <AnimatedLinearGradient
                    colors={gradientLayer2}
                    animatedProps={gradientProps2}
                    style={styles.fullSize}
                />
            </Animated.View>

            {showGlowingDots && (
                <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                    <Animated.View style={[blob1Style, { borderRadius: blobBorderRadius, overflow: 'hidden' }]}>
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.1)']}
                            start={{ x: 0.3, y: 0.3 }}
                            end={{ x: 0.9, y: 0.9 }}
                            style={{ width: '100%', height: '100%', borderRadius: blobBorderRadius }}
                        />
                    </Animated.View>
                </View>
            )}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    fullSize: {
        width: '100%',
        height: '100%',
        borderRadius: 1000, // Большое значение, чтобы быть уверенным в круглой форме
    }
})