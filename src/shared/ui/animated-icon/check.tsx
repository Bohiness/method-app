import { useColors, useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { useEffect } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, {
    Easing,
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop } from 'react-native-svg'

interface AnimatedCheckProps {
    size?: number
    color?: string
    className?: string
    style?: StyleProp<ViewStyle>
    strokeWidth?: number
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'tint' | 'muted'
    invertInDark?: boolean
    disabled?: boolean
    disabledOpacity?: number
    fill?: string
    animationDelay?: number
}

export const AnimatedCheck = ({
    size = 24,
    color,
    className,
    style,
    strokeWidth = 2,
    variant = 'default',
    invertInDark = false,
    disabled = false,
    disabledOpacity = 0.5,
    fill = 'transparent',
    animationDelay = 300,
}: AnimatedCheckProps) => {
    const { isDark } = useTheme()
    const colors = useColors()

    // Анимированные значения
    const scale = useSharedValue(0)
    const opacity = useSharedValue(0)
    const checkProgress = useSharedValue(0)
    const glowOpacity = useSharedValue(0)

    // Анимации фейерверков
    const firework1Scale = useSharedValue(0)
    const firework2Scale = useSharedValue(0)
    const firework3Scale = useSharedValue(0)
    const firework4Scale = useSharedValue(0)

    // Дополнительные фейерверки
    const firework5Scale = useSharedValue(0)
    const firework6Scale = useSharedValue(0)
    const firework7Scale = useSharedValue(0)

    // Осыпающиеся частицы
    const fallingParticle1 = useSharedValue({ x: 0, y: 0, opacity: 0 })
    const fallingParticle2 = useSharedValue({ x: 0, y: 0, opacity: 0 })
    const fallingParticle3 = useSharedValue({ x: 0, y: 0, opacity: 0 })
    const fallingParticle4 = useSharedValue({ x: 0, y: 0, opacity: 0 })
    const fallingParticle5 = useSharedValue({ x: 0, y: 0, opacity: 0 })
    const fallingParticle6 = useSharedValue({ x: 0, y: 0, opacity: 0 })

    // Волновой эффект
    const burstWave1 = useSharedValue(0)
    const burstWave2 = useSharedValue(0)

    const sparkle1Opacity = useSharedValue(0)
    const sparkle2Opacity = useSharedValue(0)
    const sparkle3Opacity = useSharedValue(0)

    const particleRotate = useSharedValue(0)
    const confettiScale = useSharedValue(0)

    // Получение цвета иконки на основе варианта
    const getBaseColors = () => ({
        default: colors.text,
        primary: colors.tint,
        secondary: colors.secondary.dark,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        tint: colors.tint,
        muted: colors.inactive,
    })

    const getInvertedColors = () => ({
        default: isDark ? colors.background : colors.text,
        primary: isDark ? colors.background : colors.tint,
        secondary: isDark ? colors.background : colors.secondary.dark,
        success: isDark ? colors.background : colors.success,
        error: isDark ? colors.background : colors.error,
        warning: isDark ? colors.background : colors.warning,
        tint: isDark ? colors.background : colors.tint,
        muted: isDark ? colors.background : colors.inactive,
    })

    const getIconColor = () => {
        if (color) return color

        const variantColors = invertInDark ? getInvertedColors() : getBaseColors()
        const variantColor = variantColors[variant]

        if (disabled) {
            const alpha = Math.round(disabledOpacity * 255).toString(16).padStart(2, '0')
            return variantColor + alpha
        }

        return variantColor
    }

    // Анимированные стили
    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkProgress.value }],
    }))

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }))

    // Стили для фейерверков
    const firework1Style = useAnimatedStyle(() => ({
        transform: [{ scale: firework1Scale.value }],
        opacity: firework1Scale.value > 0.8 ? 2 - firework1Scale.value * 2 : firework1Scale.value,
    }))

    const firework2Style = useAnimatedStyle(() => ({
        transform: [{ scale: firework2Scale.value }],
        opacity: firework2Scale.value > 0.8 ? 2 - firework2Scale.value * 2 : firework2Scale.value,
    }))

    const firework3Style = useAnimatedStyle(() => ({
        transform: [{ scale: firework3Scale.value }],
        opacity: firework3Scale.value > 0.8 ? 2 - firework3Scale.value * 2 : firework3Scale.value,
    }))

    const firework4Style = useAnimatedStyle(() => ({
        transform: [{ scale: firework4Scale.value }],
        opacity: firework4Scale.value > 0.8 ? 2 - firework4Scale.value * 2 : firework4Scale.value,
    }))

    // Стили для новых фейерверков
    const firework5Style = useAnimatedStyle(() => ({
        transform: [{ scale: firework5Scale.value }],
        opacity: firework5Scale.value > 0.8 ? 1.6 - firework5Scale.value * 1.6 : firework5Scale.value,
    }))

    const firework6Style = useAnimatedStyle(() => ({
        transform: [{ scale: firework6Scale.value }, { rotate: `${firework6Scale.value * 45}deg` }],
        opacity: firework6Scale.value > 0.8 ? 1.8 - firework6Scale.value * 1.8 : firework6Scale.value,
    }))

    const firework7Style = useAnimatedStyle(() => ({
        transform: [{ scale: firework7Scale.value }, { rotate: `${firework7Scale.value * -30}deg` }],
        opacity: firework7Scale.value > 0.8 ? 1.7 - firework7Scale.value * 1.7 : firework7Scale.value,
    }))

    // Осыпающиеся частицы
    const fallingParticle1Style = useAnimatedStyle(() => ({
        transform: [{ translateX: fallingParticle1.value.x }, { translateY: fallingParticle1.value.y }],
        opacity: fallingParticle1.value.opacity,
    }))

    const fallingParticle2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: fallingParticle2.value.x }, { translateY: fallingParticle2.value.y }],
        opacity: fallingParticle2.value.opacity,
    }))

    const fallingParticle3Style = useAnimatedStyle(() => ({
        transform: [{ translateX: fallingParticle3.value.x }, { translateY: fallingParticle3.value.y }],
        opacity: fallingParticle3.value.opacity,
    }))

    const fallingParticle4Style = useAnimatedStyle(() => ({
        transform: [{ translateX: fallingParticle4.value.x }, { translateY: fallingParticle4.value.y }],
        opacity: fallingParticle4.value.opacity,
    }))

    const fallingParticle5Style = useAnimatedStyle(() => ({
        transform: [{ translateX: fallingParticle5.value.x }, { translateY: fallingParticle5.value.y }],
        opacity: fallingParticle5.value.opacity,
    }))

    const fallingParticle6Style = useAnimatedStyle(() => ({
        transform: [{ translateX: fallingParticle6.value.x }, { translateY: fallingParticle6.value.y }],
        opacity: fallingParticle6.value.opacity,
    }))

    // Волновой эффект
    const burstWave1Style = useAnimatedStyle(() => ({
        transform: [{ scale: burstWave1.value }],
        opacity: burstWave1.value > 0.2 ? 0.4 - burstWave1.value * 0.4 : burstWave1.value * 2,
    }))

    const burstWave2Style = useAnimatedStyle(() => ({
        transform: [{ scale: burstWave2.value }],
        opacity: burstWave2.value > 0.2 ? 0.3 - burstWave2.value * 0.3 : burstWave2.value * 1.5,
    }))

    const sparkleStyles = [
        useAnimatedStyle(() => ({
            opacity: sparkle1Opacity.value,
            transform: [{ translateX: 10 * sparkle1Opacity.value }, { translateY: -8 * sparkle1Opacity.value }],
        })),
        useAnimatedStyle(() => ({
            opacity: sparkle2Opacity.value,
            transform: [{ translateX: -12 * sparkle2Opacity.value }, { translateY: -5 * sparkle2Opacity.value }],
        })),
        useAnimatedStyle(() => ({
            opacity: sparkle3Opacity.value,
            transform: [{ translateX: 8 * sparkle3Opacity.value }, { translateY: 10 * sparkle3Opacity.value }],
        })),
    ]

    const particleStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${particleRotate.value}deg` }],
    }))

    const confettiStyle = useAnimatedStyle(() => ({
        opacity: confettiScale.value,
        transform: [{ scale: confettiScale.value }],
    }))

    // Запуск анимации при монтировании компонента
    useEffect(() => {
        // Появление иконки
        opacity.value = withDelay(
            animationDelay,
            withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
        )

        // Анимация появления галочки
        scale.value = withDelay(
            animationDelay,
            withSpring(1, { damping: 12, stiffness: 120 })
        )

        checkProgress.value = withDelay(
            animationDelay + 100,
            withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
        )

        // Свечение вокруг галочки
        glowOpacity.value = withDelay(
            animationDelay + 400,
            withSequence(
                withTiming(0.8, { duration: 300 }),
                withTiming(0.4, { duration: 500 }),
                withRepeat(
                    withSequence(
                        withTiming(0.6, { duration: 700, easing: Easing.inOut(Easing.sin) }),
                        withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                )
            )
        )

        // Волновые эффекты
        burstWave1.value = withDelay(
            animationDelay + 400,
            withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
        )

        burstWave2.value = withDelay(
            animationDelay + 550,
            withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) })
        )

        // Анимация фейерверков
        firework1Scale.value = withDelay(
            animationDelay + 450,
            withTiming(1.2, { duration: 700, easing: Easing.out(Easing.cubic) })
        )

        firework2Scale.value = withDelay(
            animationDelay + 550,
            withTiming(1.1, { duration: 650, easing: Easing.out(Easing.cubic) })
        )

        firework3Scale.value = withDelay(
            animationDelay + 650,
            withTiming(1.3, { duration: 800, easing: Easing.out(Easing.cubic) })
        )

        firework4Scale.value = withDelay(
            animationDelay + 750,
            withTiming(1.2, { duration: 750, easing: Easing.out(Easing.cubic) })
        )

        // Новые фейерверки с разными задержками
        firework5Scale.value = withDelay(
            animationDelay + 500,
            withTiming(1.4, { duration: 900, easing: Easing.out(Easing.cubic) })
        )

        firework6Scale.value = withDelay(
            animationDelay + 620,
            withTiming(1.3, { duration: 850, easing: Easing.out(Easing.cubic) })
        )

        firework7Scale.value = withDelay(
            animationDelay + 700,
            withTiming(1.5, { duration: 950, easing: Easing.out(Easing.cubic) })
        )

        // Осыпающиеся частицы
        // Частица 1
        fallingParticle1.value = withDelay(
            animationDelay + 550,
            withTiming(
                { x: 15, y: 20, opacity: 0 },
                { duration: 1200, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            )
        )

        // Частица 2
        fallingParticle2.value = withDelay(
            animationDelay + 600,
            withTiming(
                { x: -18, y: 24, opacity: 0 },
                { duration: 1400, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            )
        )

        // Частица 3
        fallingParticle3.value = withDelay(
            animationDelay + 650,
            withTiming(
                { x: 10, y: 22, opacity: 0 },
                { duration: 1300, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            )
        )

        // Частица 4
        fallingParticle4.value = withDelay(
            animationDelay + 700,
            withTiming(
                { x: -12, y: 18, opacity: 0 },
                { duration: 1100, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            )
        )

        // Частица 5
        fallingParticle5.value = withDelay(
            animationDelay + 750,
            withTiming(
                { x: 20, y: 25, opacity: 0 },
                { duration: 1500, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            )
        )

        // Частица 6
        fallingParticle6.value = withDelay(
            animationDelay + 800,
            withTiming(
                { x: -15, y: 23, opacity: 0 },
                { duration: 1350, easing: Easing.bezier(0.25, 1, 0.5, 1) },
            )
        )

        // Запускаем частицы
        fallingParticle1.value = withDelay(
            animationDelay + 500,
            withSequence(
                withTiming({ x: 0, y: 0, opacity: 1 }, { duration: 100 }),
                withTiming(
                    { x: 15, y: 20, opacity: 0 },
                    { duration: 1200, easing: Easing.bezier(0.25, 1, 0.5, 1) },
                )
            )
        )

        fallingParticle2.value = withDelay(
            animationDelay + 600,
            withSequence(
                withTiming({ x: 0, y: 0, opacity: 1 }, { duration: 100 }),
                withTiming(
                    { x: -18, y: 24, opacity: 0 },
                    { duration: 1400, easing: Easing.bezier(0.25, 1, 0.5, 1) },
                )
            )
        )

        fallingParticle3.value = withDelay(
            animationDelay + 650,
            withSequence(
                withTiming({ x: 0, y: 0, opacity: 1 }, { duration: 100 }),
                withTiming(
                    { x: 10, y: 22, opacity: 0 },
                    { duration: 1300, easing: Easing.bezier(0.25, 1, 0.5, 1) },
                )
            )
        )

        fallingParticle4.value = withDelay(
            animationDelay + 700,
            withSequence(
                withTiming({ x: 0, y: 0, opacity: 1 }, { duration: 100 }),
                withTiming(
                    { x: -12, y: 18, opacity: 0 },
                    { duration: 1100, easing: Easing.bezier(0.25, 1, 0.5, 1) },
                )
            )
        )

        fallingParticle5.value = withDelay(
            animationDelay + 750,
            withSequence(
                withTiming({ x: 0, y: 0, opacity: 1 }, { duration: 100 }),
                withTiming(
                    { x: 20, y: 25, opacity: 0 },
                    { duration: 1500, easing: Easing.bezier(0.25, 1, 0.5, 1) },
                )
            )
        )

        fallingParticle6.value = withDelay(
            animationDelay + 800,
            withSequence(
                withTiming({ x: 0, y: 0, opacity: 1 }, { duration: 100 }),
                withTiming(
                    { x: -15, y: 23, opacity: 0 },
                    { duration: 1350, easing: Easing.bezier(0.25, 1, 0.5, 1) },
                )
            )
        )

        // Анимация блесток
        sparkle1Opacity.value = withDelay(
            animationDelay + 500,
            withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 600 })
            )
        )

        sparkle2Opacity.value = withDelay(
            animationDelay + 600,
            withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 600 })
            )
        )

        sparkle3Opacity.value = withDelay(
            animationDelay + 700,
            withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 600 })
            )
        )

        // Вращение частиц
        particleRotate.value = withDelay(
            animationDelay + 450,
            withRepeat(
                withTiming(360, {
                    duration: 5000,
                    easing: Easing.linear
                }),
                -1,
                false
            )
        )

        // Конфетти
        confettiScale.value = withDelay(
            animationDelay + 450,
            withSequence(
                withTiming(1, { duration: 500 }),
                withRepeat(
                    withSequence(
                        withTiming(0.9, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                )
            )
        )
    }, [])

    // Цвет иконки
    const iconColor = getIconColor()
    const strokeW = Math.max(1, strokeWidth)
    const viewBoxSize = 24

    return (
        <Animated.View
            style={[containerStyle, style, { width: size, height: size }]}
            className={cn('items-center justify-center', className)}
            entering={FadeIn}
        >
            {/* Волновой эффект */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2.5,
                        height: size * 2.5,
                        left: -size * 0.75,
                        top: -size * 0.75,
                    },
                    burstWave1Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 60 60">
                    <Circle
                        cx="30"
                        cy="30"
                        r="28"
                        fill="transparent"
                        stroke={iconColor}
                        strokeWidth="0.5"
                        strokeOpacity="0.5"
                    />
                </Svg>
            </Animated.View>

            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2.8,
                        height: size * 2.8,
                        left: -size * 0.9,
                        top: -size * 0.9,
                    },
                    burstWave2Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 70 70">
                    <Circle
                        cx="35"
                        cy="35"
                        r="32"
                        fill="transparent"
                        stroke={iconColor}
                        strokeWidth="0.5"
                        strokeOpacity="0.4"
                        strokeDasharray="3,3"
                    />
                </Svg>
            </Animated.View>

            {/* Свечение */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                        left: -size * 0.5,
                        top: -size * 0.5,
                    },
                    glowStyle
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox={`0 0 48 48`}>
                    <Defs>
                        <RadialGradient
                            id="checkGlow"
                            cx="24"
                            cy="24"
                            r="16"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0.2" stopColor={iconColor} stopOpacity="0.3" />
                            <Stop offset="1" stopColor={iconColor} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx="24" cy="24" r="20" fill="url(#checkGlow)" />
                </Svg>
            </Animated.View>

            {/* Фейерверк 1 */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                        left: -size * 0.5,
                        top: -size * 0.5,
                    },
                    firework1Style
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox="0 0 48 48">
                    <G opacity="0.8">
                        <Path
                            d="M14 14 L10 10 M14 34 L10 38 M34 14 L38 10 M34 34 L38 38"
                            stroke={iconColor}
                            strokeWidth={strokeW * 0.6}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Фейерверк 2 */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                        left: -size * 0.5,
                        top: -size * 0.5,
                    },
                    firework2Style
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox="0 0 48 48">
                    <G opacity="0.7">
                        <Path
                            d="M24 8 L24 2 M8 24 L2 24 M40 24 L46 24 M24 40 L24 46"
                            stroke={iconColor}
                            strokeWidth={strokeW * 0.6}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Фейерверк 3 */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                        left: -size * 0.5,
                        top: -size * 0.5,
                    },
                    firework3Style
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox="0 0 48 48">
                    <G opacity="0.8">
                        <Path
                            d="M18 10 L16 4 M10 18 L4 16 M38 30 L44 32 M30 38 L32 44"
                            stroke={iconColor}
                            strokeWidth={strokeW * 0.6}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Фейерверк 4 */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                        left: -size * 0.5,
                        top: -size * 0.5,
                    },
                    firework4Style
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox="0 0 48 48">
                    <G opacity="0.7">
                        <Path
                            d="M30 10 L32 4 M38 18 L44 16 M10 30 L4 32 M18 38 L16 44"
                            stroke={iconColor}
                            strokeWidth={strokeW * 0.6}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Новый фейерверк 5 - круговой */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2.2,
                        height: size * 2.2,
                        left: -size * 0.6,
                        top: -size * 0.6,
                    },
                    firework5Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 54 54">
                    <G opacity="0.75">
                        <Line x1="27" y1="10" x2="27" y2="4" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="36" y1="13" x2="40" y2="8" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="41" y1="22" x2="47" y2="20" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="39" y1="32" x2="44" y2="36" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="31" y1="38" x2="33" y2="44" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="21" y1="39" x2="19" y2="45" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="13" y1="34" x2="8" y2="38" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="10" y1="25" x2="4" y2="23" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="12" y1="16" x2="7" y2="12" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                        <Line x1="19" y1="11" x2="16" y2="6" stroke={iconColor} strokeWidth="0.6" strokeLinecap="round" />
                    </G>
                </Svg>
            </Animated.View>

            {/* Новый фейерверк 6 - звезда */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2.1,
                        height: size * 2.1,
                        left: -size * 0.55,
                        top: -size * 0.55,
                    },
                    firework6Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 52 52">
                    <G opacity="0.7">
                        <Path
                            d="M26 10 L28 20 L38 20 L30 26 L34 36 L26 30 L18 36 L22 26 L14 20 L24 20 L26 10Z"
                            stroke={iconColor}
                            strokeWidth="0.5"
                            fill="transparent"
                            strokeOpacity="0.7"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Новый фейерверк 7 - лучи */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2.3,
                        height: size * 2.3,
                        left: -size * 0.65,
                        top: -size * 0.65,
                    },
                    firework7Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 56 56">
                    <G opacity="0.8">
                        <Line x1="28" y1="5" x2="28" y2="15" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />
                        <Line x1="28" y1="41" x2="28" y2="51" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />
                        <Line x1="5" y1="28" x2="15" y2="28" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />
                        <Line x1="41" y1="28" x2="51" y2="28" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />

                        <Line x1="12" y1="12" x2="19" y2="19" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />
                        <Line x1="37" y1="37" x2="44" y2="44" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />
                        <Line x1="12" y1="44" x2="19" y2="37" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />
                        <Line x1="37" y1="19" x2="44" y2="12" stroke={iconColor} strokeWidth="0.7" strokeLinecap="round" />
                    </G>
                </Svg>
            </Animated.View>

            {/* Осыпающиеся частицы */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 0.4,
                        height: size * 0.4,
                    },
                    fallingParticle1Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 10 10">
                    <Circle cx="5" cy="5" r="2" fill={iconColor} />
                </Svg>
            </Animated.View>

            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 0.3,
                        height: size * 0.3,
                    },
                    fallingParticle2Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 8 8">
                    <Path d="M4 1L7 4L4 7L1 4L4 1Z" fill={iconColor} />
                </Svg>
            </Animated.View>

            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 0.3,
                        height: size * 0.3,
                    },
                    fallingParticle3Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 8 8">
                    <Circle cx="4" cy="4" r="1.5" fill={iconColor} />
                </Svg>
            </Animated.View>

            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 0.25,
                        height: size * 0.25,
                    },
                    fallingParticle4Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 6 6">
                    <Path d="M3 1L5 3L3 5L1 3L3 1Z" fill={iconColor} />
                </Svg>
            </Animated.View>

            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 0.35,
                        height: size * 0.35,
                    },
                    fallingParticle5Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 8 8">
                    <Path d="M4 0L5.5 2.5L8 3L5.5 3.5L4 6L2.5 3.5L0 3L2.5 2.5L4 0Z" fill={iconColor} />
                </Svg>
            </Animated.View>

            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 0.3,
                        height: size * 0.3,
                    },
                    fallingParticle6Style
                ]}
            >
                <Svg width="100%" height="100%" viewBox="0 0 8 8">
                    <Circle cx="4" cy="4" r="1.8" fill={iconColor} />
                </Svg>
            </Animated.View>

            {/* Вращающиеся частицы */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                        left: -size * 0.5,
                        top: -size * 0.5,
                    },
                    particleStyle
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox="0 0 48 48">
                    <G opacity="0.5">
                        <Circle cx="14" cy="14" r="1" fill={iconColor} />
                        <Circle cx="34" cy="14" r="1" fill={iconColor} />
                        <Circle cx="14" cy="34" r="1" fill={iconColor} />
                        <Circle cx="34" cy="34" r="1" fill={iconColor} />
                        <Circle cx="24" cy="8" r="1" fill={iconColor} />
                        <Circle cx="8" cy="24" r="1" fill={iconColor} />
                        <Circle cx="40" cy="24" r="1" fill={iconColor} />
                        <Circle cx="24" cy="40" r="1" fill={iconColor} />
                    </G>
                </Svg>
            </Animated.View>

            {/* Конфетти */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                        left: -size * 0.5,
                        top: -size * 0.5,
                    },
                    confettiStyle
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox="0 0 48 48">
                    <G opacity="0.5">
                        <Path d="M20 16L22 14L24 16L22 18L20 16Z" fill={iconColor} opacity="0.7" />
                        <Path d="M32 28L34 26L36 28L34 30L32 28Z" fill={iconColor} opacity="0.6" />
                        <Path d="M12 26L14 24L16 26L14 28L12 26Z" fill={iconColor} opacity="0.8" />
                        <Path d="M26 34L28 32L30 34L28 36L26 34Z" fill={iconColor} opacity="0.7" />
                        <Path d="M15 20L16 19L17 20L16 21L15 20Z" fill={iconColor} opacity="0.7" />
                        <Path d="M30 20L31 19L32 20L31 21L30 20Z" fill={iconColor} opacity="0.6" />
                        <Path d="M22 30L23 29L24 30L23 31L22 30Z" fill={iconColor} opacity="0.8" />
                    </G>
                </Svg>
            </Animated.View>

            {/* Блестки */}
            {sparkleStyles.map((style, index) => (
                <Animated.View
                    key={`sparkle-${index}`}
                    style={[
                        {
                            position: 'absolute',
                            width: size * 0.7,
                            height: size * 0.7,
                        },
                        style
                    ]}
                >
                    <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 16 16">
                        <Path
                            d={index === 0 ? "M8 2L9 7L14 8L9 9L8 14L7 9L2 8L7 7L8 2Z" :
                                index === 1 ? "M8 3L8.5 6.5L12 7L8.5 7.5L8 11L7.5 7.5L4 7L7.5 6.5L8 3Z" :
                                    "M8 4L9 7L12 8L9 9L8 12L7 9L4 8L7 7L8 4Z"}
                            fill={iconColor}
                            opacity="0.9"
                        />
                    </Svg>
                </Animated.View>
            ))}

            {/* Галочка */}
            <Animated.View style={checkStyle}>
                <Svg width={size} height={size} viewBox="0 0 24 24">
                    <Path
                        d="M5 13L9 17L19 7"
                        stroke={iconColor}
                        strokeWidth={strokeW * 1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="transparent"
                    />
                </Svg>
            </Animated.View>
        </Animated.View>
    )
}
