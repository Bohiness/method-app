// src/shared/ui/Button/index.tsx
import { useColors } from '@shared/context/theme-provider'
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
    icon: IconName
    iconSize?: number
    iconProps?: {
        color?: string
        size?: number
        fill?: string
    }
    className?: string
    children: React.ReactNode
    haptic?: boolean
    bgColor?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const IconButtonWithText: React.FC<ButtonProps> = ({
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconSize = 24,
    className = '',
    children,
    haptic = true,
    onPress,
    iconProps,
    bgColor,
    ...props
}) => {
    const colors = useColors()
    const pressed = useSharedValue(0)

    if (!icon) {
        console.error('Icon is required')
        return null
    }

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

    // Размеры кнопки для вертикального расположения
    const sizeClasses = {
        sm: 'py-3 px-3',
        md: 'py-4 px-4',
        lg: 'py-5 px-5',
    }[size]

    // Варианты стилей
    const getVariantClasses = () => {
        if (bgColor) {
            return `bg-[${bgColor}] dark:bg-[${bgColor}]`
        }
        const baseClasses = {
            default: `bg-text dark:bg-text-dark`,
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

    return (
        <View className={cn(
            'flex-col items-center justify-center',
            widthClasses,
            className
        )}>
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
                    'aspect-square items-center justify-center'
                )}
                {...props}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variantColors.icon}
                        className="size-5"
                    />
                ) : (
                    <Icon
                        name={icon}
                        size={iconProps?.size || iconSize}
                        color={iconProps?.color || variantColors.icon}
                        fill={iconProps?.fill}
                    />
                )}
            </AnimatedPressable>

            {!loading && (
                <Text
                    className="mt-2 truncate text-center max-w-[100%]"
                    numberOfLines={1}
                    size={'sm'}
                >
                    {children}
                </Text>
            )}
        </View>
    )
}