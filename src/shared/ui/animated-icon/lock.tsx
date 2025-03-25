import { useColors, useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import React, { useEffect } from 'react'
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
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg'

interface AnimatedLockProps {
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

export const AnimatedLock = ({
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
}: AnimatedLockProps) => {
    const { isDark } = useTheme()
    const colors = useColors()

    // Анимированные значения
    const scale = useSharedValue(0.8)
    const rotateZ = useSharedValue(8)
    const opacity = useSharedValue(0)
    const topPartY = useSharedValue(-6)
    const glowOpacity = useSharedValue(0.3)
    const particleScale1 = useSharedValue(0.8)
    const particleScale2 = useSharedValue(0.6)
    const particleScale3 = useSharedValue(0.7)
    const particleScale4 = useSharedValue(0.5)
    const starRotate = useSharedValue(0)
    const shieldOpacity = useSharedValue(0)

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

    // Анимированные стили для контейнера
    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotateZ: `${rotateZ.value}deg` }
            ],
            opacity: opacity.value,
        }
    })

    // Анимированные стили для верхней части замка
    const topPartStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: topPartY.value }
            ]
        }
    })

    // Анимированный стиль для свечения
    const glowStyle = useAnimatedStyle(() => {
        return {
            opacity: glowOpacity.value,
        }
    })

    // Анимированные стили для частиц
    const particleStyle1 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: particleScale1.value }],
            opacity: particleScale1.value * 0.6,
        }
    })

    const particleStyle2 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: particleScale2.value }],
            opacity: particleScale2.value * 0.5,
        }
    })

    const particleStyle3 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: particleScale3.value }],
            opacity: particleScale3.value * 0.5,
        }
    })

    const particleStyle4 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: particleScale4.value }],
            opacity: particleScale4.value * 0.5,
        }
    })

    // Анимированный стиль для звездочек
    const starStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${starRotate.value}deg` }],
        }
    })

    // Анимированный стиль для защитного поля
    const shieldStyle = useAnimatedStyle(() => {
        return {
            opacity: shieldOpacity.value,
        }
    })

    // Запуск анимации при монтировании компонента
    useEffect(() => {
        // Сначала появление с отскоком
        opacity.value = withDelay(
            animationDelay,
            withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
        )

        // Анимация масштабирования иконки
        scale.value = withDelay(
            animationDelay + 200,
            withSpring(1, { damping: 12, stiffness: 120 })
        )

        // Небольшое покачивание замка
        rotateZ.value = withDelay(
            animationDelay + 200,
            withSequence(
                withTiming(-8, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                withTiming(5, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                withTiming(-3, { duration: 150, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 150, easing: Easing.inOut(Easing.quad) })
            )
        )

        // Анимация выпадения/защелкивания верхней части замка
        topPartY.value = withDelay(
            animationDelay + 400,
            withTiming(0, { duration: 300, easing: Easing.out(Easing.bounce) })
        )

        // Появление защитного поля
        shieldOpacity.value = withDelay(
            animationDelay + 600,
            withTiming(0.3, { duration: 600, easing: Easing.out(Easing.cubic) })
        )

        // Анимация пульсации свечения
        glowOpacity.value = withDelay(
            animationDelay + 600,
            withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.sin) })
                ),
                -1, // бесконечное повторение
                true // реверсивная анимация
            )
        )

        // Анимация вращения звездочек
        starRotate.value = withDelay(
            animationDelay + 700,
            withRepeat(
                withTiming(360, {
                    duration: 10000,
                    easing: Easing.linear
                }),
                -1,
                false
            )
        )

        // Анимация частиц
        particleScale1.value = withDelay(
            animationDelay + 800,
            withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        )

        particleScale2.value = withDelay(
            animationDelay + 900,
            withRepeat(
                withSequence(
                    withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        )

        particleScale3.value = withDelay(
            animationDelay + 1000,
            withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.7, { duration: 1800, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        )

        particleScale4.value = withDelay(
            animationDelay + 1100,
            withRepeat(
                withSequence(
                    withTiming(0.9, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.5, { duration: 1600, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        )
    }, [])

    // Цвет иконки
    const iconColor = getIconColor()

    // Вычисляем размеры и позиции для SVG элементов
    const strokeW = Math.max(1, strokeWidth)
    const viewBoxSize = 24
    const scaleFactor = size / viewBoxSize

    return (
        <Animated.View
            style={[containerStyle, style, { width: size, height: size }]}
            className={cn('items-center justify-center', className)}
            entering={FadeIn}
        >
            {/* Увеличенное свечение вокруг замка */}
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
                <Svg width={size * 2} height={size * 2} viewBox={`0 0 36 36`}>
                    <Defs>
                        <RadialGradient
                            id="glow"
                            cx="44"
                            cy="18"
                            r="10"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0.2" stopColor={iconColor} stopOpacity="0.2" />
                            <Stop offset="1" stopColor={iconColor} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx="18" cy="18" r="16" fill="url(#glow)" />
                </Svg>
            </Animated.View>


            {/* Звездочки вокруг */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        width: size * 2,
                        height: size * 2,
                    },
                    starStyle
                ]}
            >
                <Svg width={size * 2} height={size * 2} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
                    <G opacity="0.1">
                        <Path
                            d="M5 5L5.5 3.5L6 5L7.5 5.5L6 6L5.5 7.5L5 6L3.5 5.5L5 5Z"
                            fill={iconColor}
                        />
                        <Path
                            d="M19 19L19.5 17.5L20 19L21.5 19.5L20 20L19.5 21.5L19 20L17.5 19.5L19 19Z"
                            fill={iconColor}
                        />
                        <Path
                            d="M19 5L19.5 3.5L20 5L21.5 5.5L20 6L19.5 7.5L19 6L17.5 5.5L19 5Z"
                            fill={iconColor}
                        />
                        <Path
                            d="M5 19L5.5 17.5L6 19L7.5 19.5L6 20L5.5 21.5L5 20L3.5 19.5L5 19Z"
                            fill={iconColor}
                        />
                    </G>
                </Svg>
            </Animated.View>


            {/* Основная часть замка (корпус) */}
            <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
                {/* Корпус замка */}
                <Rect
                    x={5}
                    y={10}
                    width={14}
                    height={11}
                    rx={3}
                    stroke={iconColor}
                    strokeWidth={strokeW}
                    fill={fill}
                />

                {/* Отверстие для ключа */}
                <Circle
                    cx="12"
                    cy="15.5"
                    r="1.5"
                    fill={iconColor}
                    fillOpacity="0.3"
                    stroke={iconColor}
                    strokeWidth={strokeW * 0.5}
                />
                <Path
                    d="M12 15.5V18"
                    stroke={iconColor}
                    strokeWidth={strokeW * 0.8}
                    strokeLinecap="round"
                />
            </Svg>

            {/* Верхняя часть замка (дужка) - анимируется отдельно */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: size,
                        height: size
                    },
                    topPartStyle
                ]}
            >
                <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
                    <Path
                        d="M7 10V6.5C7 3.6 9.2 1.5 12 1.5C14.8 1.5 17 3.6 17 6.5V10"
                        stroke={iconColor}
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </Svg>
            </Animated.View>
        </Animated.View>
    )
}
