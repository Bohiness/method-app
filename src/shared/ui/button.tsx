// src/shared/ui/Button/index.tsx
import { useColors, useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
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
    rightIcon?: IconName
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
                text: colors.text,
                icon: colors.text,
                background: 'transparent'
            },
            tint: {
                text: colors.background,
                icon: colors.background,
                background: colors.tint
            },
            destructive: {
                text: colors.background,
                icon: colors.background,
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

    // Варианты стилей
    const getVariantClasses = () => {
        const baseClasses = {
            default: `bg-background-dark dark:bg-background`,
            secondary: `bg-surface-stone dark:bg-surface-stone`,
            outline: `border border-border dark:border-border bg-transparent`,
            ghost: `bg-transparent`,
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
        <AnimatedPressable
            disabled={disabled || loading}
            onPressIn={() => { pressed.value = 1 }}
            onPressOut={() => { pressed.value = 0 }}
            onPress={handlePress}
            style={animatedStyle}
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
                            <View className="mr-2 -ml-2">
                                <Icon
                                    name={leftIcon}
                                    size={24}
                                    color={variantColors.icon}
                                />
                            </View>
                        )}
                        <Text
                            className="text-inherit"
                            style={{ color: variantColors.text }}
                            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'}
                            weight="medium"
                        >
                            {children}
                        </Text>
                        {rightIcon && (
                            <View className="ml-2">
                                <Icon
                                    name={rightIcon}
                                    size={24}
                                    color={variantColors.icon}
                                />
                            </View>
                        )}
                    </>
                )}
            </View>
        </AnimatedPressable>
    )
}