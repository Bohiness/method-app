// src/shared/ui/Button/index.tsx
import { useColors, useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { Icon, IconName } from './icon'
import { Text } from './text'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'tint' | 'destructive' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends PressableProps {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    disabled?: boolean
    fullWidth?: boolean
    leftIcon?: IconName
    iconSize?: number
    iconProps?: {
        color?: string
        size?: number
        fill?: string
    }
    rightIcon?: IconName
    className?: string
    children?: React.ReactNode
    haptic?: boolean
    bgColor?: string
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
    iconSize = 24,
    className = '',
    children,
    haptic = true,
    onPress,
    iconProps,
    bgColor,
    ...props
}) => {
    const { isDark } = useTheme()
    const colors = useColors()
    const pressed = useSharedValue(0)

    const getColors = (variant: ButtonVariant) => {
        const variantColors = {
            default: {
                text: colors.background,
                icon: colors.background,
                background: colors.text
            },
            secondary: {
                text: colors.text,
                icon: colors.text,
                background: colors.surface.stone
            },
            outline: {
                text: colors.text,
                icon: colors.text,
                background: 'transparent'
            },
            ghost: {
                text: colors.secondary.dark,
                icon: colors.secondary.dark,
                background: 'transparent'
            },
            tint: {
                text: colors.background,
                icon: colors.background,
                background: colors.tint
            },
            destructive: {
                text: colors.text,
                icon: colors.text,
                background: colors.error
            }
        }
        return variantColors[variant]
    }

    const variantColors = getColors(variant)

    // Размеры кнопки
    const sizeClasses = {
        sm: 'py-2 px-3',
        md: 'py-4 px-10',
        lg: 'py-6 px-12',
    }[size]

    const sizeClassesButtonIcon = {
        sm: 'py-2 px-2',
        md: 'py-2 px-4',
        lg: 'py-2 px-6',
    }[size]


    // Варианты стилей
    const getVariantClasses = () => {
        if (bgColor) {
            console.log(bgColor)
            return `bg-[${bgColor}] dark:bg-[${bgColor}]`
        }
        const baseClasses = {
            default: `bg-background-dark dark:bg-background`,
            secondary: `bg-surface-paper dark:bg-surface-paper-dark`,
            outline: `border border-border dark:border-border bg-transparent`,
            ghost: `bg-transparent border border-transparent dark:border-transparent`,
            tint: `bg-tint dark:bg-tint`,
            destructive: `bg-error dark:bg-error`,
        }[variant]

        return baseClasses
    }

    const disabledClasses = disabled ? 'opacity-30' : ''
    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{
            scale: withSpring(pressed.value ? 0.97 : 1, {
                mass: 0.5,
                damping: 12,
                stiffness: 150,
            }),
        }],
    }))

    const handlePress = async (e: any) => {
        if (haptic) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
        onPress?.(e)
    }

    if (!children && leftIcon) {
        return (
            <AnimatedPressable
                disabled={disabled || loading}
                onPressIn={() => { pressed.value = 1 }}
                onPressOut={() => { pressed.value = 0 }}
                onPress={handlePress}
                style={animatedStyle}
                className={cn(
                    'relative rounded-full active:opacity-90 flex-row items-center justify-center',
                    getVariantClasses(),
                    sizeClassesButtonIcon,
                    disabledClasses,
                    widthClasses,
                    className,
                )}
                {...props}
            >
                <Icon
                    name={leftIcon}
                    size={iconSize}
                    color={iconProps?.color || variantColors.icon}
                    fill={iconProps?.fill}
                />
            </AnimatedPressable>
        )
    }

    return (
        <AnimatedPressable
            disabled={disabled || loading}
            onPressIn={() => { pressed.value = 1 }}
            onPressOut={() => { pressed.value = 0 }}
            onPress={handlePress}
            style={[animatedStyle, bgColor && { backgroundColor: bgColor }]}
            className={cn(
                'rounded-full active:opacity-90',
                getVariantClasses(),
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
                        color={variantColors.icon}
                        className="h-5 w-5"
                    />
                ) : (
                    <>
                        {leftIcon && (
                            <View className={'mr-2 -ml-2'}>
                                <Icon
                                    name={leftIcon}
                                    size={iconProps?.size || iconSize}
                                    color={iconProps?.color || variantColors.icon}
                                    fill={iconProps?.fill}
                                />
                            </View>
                        )}
                        {children &&
                            <Text
                                className="text-inherit truncate"
                                style={{
                                    color: variantColors.text,
                                    maxWidth: '100%'
                                }}
                                numberOfLines={1}
                                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'}
                                weight="medium"
                            >
                                {children}
                            </Text>
                        }
                        {rightIcon && (
                            <View className="ml-2">
                                <Icon
                                    name={rightIcon}
                                    size={iconProps?.size || iconSize}
                                    color={iconProps?.color || variantColors.icon}
                                    fill={iconProps?.fill}
                                />
                            </View>
                        )}
                    </>
                )}
            </View>
        </AnimatedPressable>
    )
}