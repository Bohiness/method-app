import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { icons } from 'lucide-react-native'
import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export type IconName = keyof typeof icons

interface IconProps {
    name: IconName
    size?: number
    color?: string
    className?: string
    style?: StyleProp<ViewStyle>
    strokeWidth?: number
    variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'tint'
}

export function Icon({
    name,
    size = 24,
    color,
    className,
    style,
    strokeWidth = 2,
    variant = 'default'
}: IconProps) {
    const { colors } = useTheme()
    const LucideIcon = icons[name]

    // Маппинг вариантов на цвета из темы
    const variantColors = {
        default: colors.text,
        primary: colors.tint,
        secondary: colors.secondaryText,
        accent: colors.accent,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        tint: colors.tint
    }

    // Если color проп передан явно, используем его
    // В противном случае берем цвет из варианта
    const iconColor = color || variantColors[variant]

    return (
        <LucideIcon
            size={size}
            color={iconColor}
            className={cn(className)}
            style={style}
            strokeWidth={strokeWidth}
        />
    )
}