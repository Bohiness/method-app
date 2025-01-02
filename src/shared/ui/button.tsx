// src/shared/ui/Button/index.tsx

import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { Text } from './styled-text'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'tint' | 'destructive' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends PressableProps {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    disabled?: boolean
    fullWidth?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    className?: string
    children?: React.ReactNode
    haptic?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const Button: React.FC<ButtonProps> = ({
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    children,
    haptic = true,
    onPress,
    ...props
}) => {
    const pressed = useSharedValue(0)

    // Определяем цвет текста в зависимости от варианта и темы
    const getTextColor = (variant: ButtonVariant) => {
        const textColors = {
            default: 'text-text-dark dark:text-surface-dark',
            secondary: 'text-text dark:text-text-dark',
            outline: 'text-text dark:text-text-dark',
            ghost: 'text-text dark:text-text-dark',
            tint: 'text-surface dark:text-surface',
            destructive: 'text-error dark:text-error',
        }
        return textColors[variant]
    }

    // ---------------------------
    // 1) Размеры кнопки
    // ---------------------------
    const sizeClasses = {
        sm: 'py-2 px-3',
        md: 'py-4 px-10',
        lg: 'py-6 px-12',
    }[size]

    // ---------------------------
    // 2) Варианты стилей
    // ---------------------------
    // По вашему требованию:
    // - default (light): чёрный фон, белый текст
    // - default (dark): белый фон, чёрный текст
    // Остальные варианты тоже инвертируют цвета при dark:...
    const variantClasses = {
        default: `
            bg-surface-dark 
            dark:bg-surface
        `,
        secondary: `
            bg-surface border-border
            dark:bg-surface-dark dark:border dark:border-border
        `,
        outline: `
            border border-background-dark bg-transparent
            dark:border-border dark:bg-transparent
        `,
        ghost: `
            bg-transparent hover:bg-black/5
            dark:bg-transparent dark:hover:bg-white/5
        `,
        tint: `
            bg-tint 
            dark:bg-white
        `,
        destructive: `
            bg-error
            dark:bg-white
        `,
    }[variant]

    // ---------------------------
    // 3) Состояние disabled
    // ---------------------------
    const disabledClasses = disabled ? 'opacity-50' : ''

    // ---------------------------
    // 4) Ширина кнопки (fullWidth)
    // ---------------------------
    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

    // ---------------------------
    // 5) Анимация нажатия
    // ---------------------------
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: withSpring(pressed.value ? 0.97 : 1, {
                    mass: 0.5,
                    damping: 12,
                    stiffness: 150,
                }),
            },
        ],
    }))

    // ---------------------------
    // 6) Обработчик нажатия (c haptics)
    // ---------------------------
    const handlePress = async (e: any) => {
        if (haptic) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
        onPress?.(e)
    }

    return (
        <AnimatedPressable
            disabled={disabled || loading}
            onPressIn={() => {
                pressed.value = 1
            }}
            onPressOut={() => {
                pressed.value = 0
            }}
            onPress={handlePress}
            style={animatedStyle}
            className={cn(
                'rounded-full active:opacity-90',
                variantClasses,
                sizeClasses,
                disabledClasses,
                widthClasses,
                className,
            )}
            {...props}
        >
            <View className="flex-row items-center justify-center space-x-2">
                {loading ? (
                    <ActivityIndicator
                        color={
                            variant === 'default'
                                ? '#FFFFFF'
                                : '#000000'
                        }
                        className="h-5 w-5"
                    />
                ) : (
                    <>
                        {leftIcon && <View className="mr-2">{leftIcon}</View>}
                        <Text
                            className={getTextColor(variant)}
                            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'}
                            weight="medium"
                        >
                            {children}
                        </Text>
                        {rightIcon && <View className="ml-2">{rightIcon}</View>}
                    </>
                )}
            </View>
        </AnimatedPressable>
    )
}