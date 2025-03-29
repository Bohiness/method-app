// src/shared/ui/Button/index.tsx
import { useColors, useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated'
import { Icon, IconName } from './icon'
import { Text } from './text'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'tint' | 'destructive' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends PressableProps {
    animated?: boolean
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
    textColor?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const Button: React.FC<ButtonProps> = ({
    animated = true,
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    iconSize,
    className = '',
    children,
    haptic = true,
    onPress,
    iconProps,
    bgColor,
    textColor,
    ...props
}) => {
    const { isDark } = useTheme()
    const colors = useColors()
    const pressed = useSharedValue(0)

    // Определяем размер иконки на основе размера кнопки
    const sizeBasedIconSize = {
        sm: 16,
        md: 20,
        lg: 24,
    }[size]

    // Приоритет: iconProps?.size > iconSize > sizeBasedIconSize
    const currentIconSize = iconProps?.size || iconSize || sizeBasedIconSize

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

    // Фиксированная высота для каждого размера кнопки
    const buttonHeights = {
        sm: 'h-10',
        md: 'h-14',
        lg: 'h-16',
    }[size]

    // Горизонтальные отступы
    const horizontalPadding = {
        sm: children ? 'px-3' : 'px-4',
        md: children ? 'px-10' : 'px-6',
        lg: children ? 'px-12' : 'px-8',
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

    // Общий класс для всех кнопок
    const baseButtonClasses = cn(
        'rounded-full active:opacity-90 flex-row items-center justify-center',
        buttonHeights,
        horizontalPadding,
        getVariantClasses(),
        disabledClasses,
        widthClasses,
        className,
    )

    if (!children && leftIcon) {
        // Создаем круглую кнопку с равными шириной и высотой
        const buttonSize = {
            sm: 'w-10',
            md: 'w-14',
            lg: 'w-16',
        }[size]

        const iconOnlyButtonClasses = cn(
            'rounded-full active:opacity-90 flex-row items-center justify-center',
            buttonHeights,
            buttonSize, // Используем одинаковую ширину и высоту
            getVariantClasses(),
            disabledClasses,
            className,
        )

        return (
            <AnimatedPressable
                disabled={disabled || loading}
                onPressIn={() => { pressed.value = 1 }}
                onPressOut={() => { pressed.value = 0 }}
                onPress={handlePress}
                style={[animatedStyle, bgColor && { backgroundColor: bgColor }]}
                className={iconOnlyButtonClasses}
                {...props}
            >
                <Icon
                    name={leftIcon}
                    size={currentIconSize}
                    color={iconProps?.color || variantColors.icon}
                    fill={iconProps?.fill}
                />
            </AnimatedPressable >
        )
    }

    return (
        <AnimatedPressable
            disabled={disabled || loading}
            onPressIn={() => { pressed.value = 1 }}
            onPressOut={() => { pressed.value = 0 }}
            onPress={handlePress}
            style={[animatedStyle, bgColor && { backgroundColor: bgColor }]}
            className={baseButtonClasses}
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
                                    size={currentIconSize}
                                    color={iconProps?.color || variantColors.icon}
                                    fill={iconProps?.fill}
                                />
                            </View>
                        )}
                        {children &&
                            <Text
                                className="text-inherit truncate"
                                style={{
                                    color: textColor || variantColors.text,
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
                                    size={currentIconSize}
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

export const FinishButton = ({ children, ...props }: { children: React.ReactNode } & ButtonProps) => {
    return <Button
        className="w-fit self-center px-20"
        size='lg'
        {...props}
    >
        {children}
    </Button>
}

