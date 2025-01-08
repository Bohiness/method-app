// src/shared/ui/Button/index.tsx

import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { Icon, IconName } from './icon'
import { Text } from './styled-text'

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
    leftIcon = undefined,
    rightIcon = undefined,
    className = '',
    children,
    haptic = true,
    onPress,
    ...props
}) => {
    const pressed = useSharedValue(0)

    // Определяем цвет текста и иконок в зависимости от варианта и темы
    const getColors = (variant: ButtonVariant) => {
        const colors = {
            default: {
                text: 'text-text-dark dark:text-surface-paper-dark',
                iconColor: '#000000'
            },
            secondary: {
                text: 'text-text dark:text-text-dark',
                iconColor: '#1A202C'
            },
            outline: {
                text: 'text-text dark:text-text-dark',
                iconColor: '#1A202C'
            },
            ghost: {
                text: 'text-text dark:text-text-dark',
                iconColor: '#1A202C'
            },
            tint: {
                text: 'text-surface-paper dark:text-surface-paper',
                iconColor: '#FFFFFF'
            },
            destructive: {
                text: 'text-error dark:text-error',
                iconColor: '#FFFFFF'
            },
        }
        return colors[variant]
    }

    const { text: textColor, iconColor } = getColors(variant)

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
    const variantClasses = {
        default: `
            bg-surface-paper-dark 
            dark:bg-surface-paper
        `,
        secondary: `
            bg-surface-paper border-border
            dark:bg-surface-paper-dark dark:border dark:border-border
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
    // Остальной код без изменений
    // ---------------------------
    const disabledClasses = disabled ? 'opacity-30' : ''
    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

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
                        color={iconColor}
                        className="h-5 w-5"
                    />
                ) : (
                    <>
                        {leftIcon &&
                            <View className="mr-2">
                                <Icon
                                    name={leftIcon}
                                    size={24}
                                    color={iconColor}
                                />
                            </View>
                        }
                        <Text
                            className={textColor}
                            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'}
                            weight="medium"
                        >
                            {children}
                        </Text>
                        {rightIcon &&
                            <View className="ml-2">
                                <Icon
                                    name={rightIcon}
                                    size={24}
                                    color={iconColor}
                                />
                            </View>
                        }
                    </>
                )}
            </View>
        </AnimatedPressable>
    )
}