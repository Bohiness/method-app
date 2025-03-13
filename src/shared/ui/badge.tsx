// src/shared/ui/badge/Badge.tsx
import { useTheme } from '@shared/context/theme-provider'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Text } from '@shared/ui/text'
import { X } from 'lucide-react-native'
import React from 'react'
import { TouchableOpacity, View, ViewStyle } from 'react-native'

export type BadgeVariant =
    | 'default'
    | 'primary'
    | 'outline'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'tint'

export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
    children: React.ReactNode
    variant?: BadgeVariant
    size?: BadgeSize
    onPress?: () => void
    onRemove?: () => void
    icon?: React.ReactNode
    disabled?: boolean
    style?: ViewStyle
    removable?: boolean
}

const getVariantStyles = (variant: BadgeVariant = 'default', isDark: boolean) => {
    const variants = {
        default: {
            container: isDark ? 'bg-surface-paper' : 'bg-surface-paper',
            text: isDark ? 'text-text' : 'text-text'
        },
        primary: {
            container: 'bg-tint/20',
            text: 'text-tint'
        },
        outline: {
            container: 'bg-transparent border border-border dark:border-border-dark',
            text: 'text-text dark:text-text-dark'
        },
        secondary: {
            container: 'bg-secondary-light/20',
            text: 'text-secondary-light'
        },
        success: {
            container: 'bg-success/20',
            text: 'text-success'
        },
        warning: {
            container: 'bg-warning/20',
            text: 'text-warning'
        },
        error: {
            container: 'bg-error/20',
            text: 'text-error'
        },
        tint: {
            container: 'bg-tint/20',
            text: 'text-tint'
        }
    }

    return variants[variant]
}

const getSizeStyles = (size: BadgeSize = 'md') => {
    const sizes = {
        sm: {
            container: 'px-2 py-0.5',
            text: 'text-xs',
            icon: 12
        },
        md: {
            container: 'px-2.5 py-1',
            text: 'text-sm',
            icon: 14
        },
        lg: {
            container: 'px-3 py-1.5',
            text: 'text-base',
            icon: 16
        }
    }

    return sizes[size]
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    onPress,
    onRemove,
    icon,
    disabled = false,
    style,
    removable = false,
    ...props
}) => {
    const { isDark } = useTheme()
    const variantStyles = getVariantStyles(variant, isDark)
    const sizeStyles = getSizeStyles(size)

    const Container = onPress ? HapticTab : View
    const containerProps = onPress ? { onPress, disabled } : {}

    return (
        <Container
            {...containerProps}
            {...props}
            className={`
                self-start flex-row items-center justify-center rounded-full
                ${variantStyles.container}
                ${sizeStyles.container}
                ${disabled ? 'opacity-50' : ''}
            `}
            style={style}
        >
            {icon && (
                <View className="mr-1">
                    {React.cloneElement(icon as React.ReactElement, {
                        size: sizeStyles.icon,
                        className: variantStyles.text
                    })}
                </View>
            )}

            <Text
                className={`font-medium ${variantStyles.text} ${sizeStyles.text}`}
                numberOfLines={1}
            >
                {children}
            </Text>

            {removable && onRemove && (
                <TouchableOpacity
                    onPress={onRemove}
                    className="ml-1"
                    disabled={disabled}
                >
                    <X
                        size={sizeStyles.icon}
                        className={variantStyles.text}
                    />
                </TouchableOpacity>
            )}
        </Container>
    )
}

// Предустановленные варианты
export const TintBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
    <Badge variant="tint" {...props} />
)

export const SuccessBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
    <Badge variant="success" {...props} />
)

export const ErrorBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
    <Badge variant="error" {...props} />
)

export const WarningBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
    <Badge variant="warning" {...props} />
)