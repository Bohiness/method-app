// src/shared/ui/Button/index.tsx
import { useColorScheme } from '@shared/hooks/systems/colors/useColorScheme'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Text } from './styled-text'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'tint' | 'destructive'
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
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const pressed = useSharedValue(0)

    // Базовые классы для размеров
    const sizeClasses = {
        sm: 'py-2 px-3 text-sm',
        md: 'py-3 px-4 text-base',
        lg: 'py-4 px-6 text-lg',
    }[size]

    // Базовые классы для вариантов в светлой теме
    const lightVariantClasses = {
        default: 'bg-black text-white',
        outline: 'bg-transparent border border-black text-black',
        ghost: 'bg-transparent text-black hover:bg-black/5',
        tint: 'bg-light-tint text-white',
        destructive: 'bg-light-error text-white',
    }[variant]

    // Базовые классы для вариантов в темной теме
    const darkVariantClasses = {
        default: 'bg-white text-black',
        outline: 'bg-transparent border border-white text-white',
        ghost: 'bg-transparent text-white hover:bg-white/5',
        tint: 'bg-dark-tint text-black',
        destructive: 'bg-dark-error text-white',
    }[variant]

    // Состояние disabled
    const disabledClasses = disabled ? 'opacity-50' : ''

    // Ширина кнопки
    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

    // Анимация нажатия
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(pressed.value ? 0.98 : 1) }],
        }
    })

    // Обработчик нажатия с тактильным откликом
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
                pressed.value = withSpring(1)
            }}
            onPressOut={() => {
                pressed.value = withSpring(0)
            }}
            onPress={handlePress}
            style={animatedStyle}
            className={`
        rounded-lg 
        active:opacity-90
        ${isDark ? darkVariantClasses : lightVariantClasses}
        ${sizeClasses}
        ${disabledClasses}
        ${widthClasses}
        ${className}
      `}
            {...props}
        >
            <View className="flex-row items-center justify-center space-x-2">
                {loading ? (
                    <ActivityIndicator
                        color={isDark ?
                            (variant === 'tint' ? 'black' : 'white') :
                            (variant === 'default' ? 'white' : 'black')
                        }
                        className="h-5 w-5"
                    />
                ) : (
                    <>
                        {leftIcon && (
                            <View className="mr-2">{leftIcon}</View>
                        )}
                        <Text
                            className={`
                font-medium
                ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
                ${variant === 'outline' || variant === 'ghost'
                                    ? isDark ? 'text-white' : 'text-black'
                                    : variant === 'default'
                                        ? isDark ? 'text-black' : 'text-white'
                                        : variant === 'tint'
                                            ? isDark ? 'text-black' : 'text-white'
                                            : 'text-white'}
              `}
                        >
                            {children}
                        </Text>
                        {rightIcon && (
                            <View className="ml-2">{rightIcon}</View>
                        )}
                    </>
                )}
            </View>
        </AnimatedPressable>
    )
}
