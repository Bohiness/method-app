// src/shared/ui/icon/icon.tsx
import { useColors, useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { icons } from 'lucide-react-native'
import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export type IconName = keyof typeof icons

export type IconVariant =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning'
    | 'tint'
    | 'muted'

interface IconProps {
    name: IconName
    size?: number
    color?: string
    className?: string
    style?: StyleProp<ViewStyle>
    strokeWidth?: number
    variant?: IconVariant
    invertInDark?: boolean
    disabled?: boolean
    disabledOpacity?: number
    fill?: string
}

export const Icon = memo(({
    name,
    size = 24,
    color,
    className,
    style,
    strokeWidth = 2,
    variant = 'default',
    invertInDark = false,
    disabled = false,
    disabledOpacity = 0.5,
    fill = 'transparent'
}: IconProps) => {
    const { isDark } = useTheme()
    const colors = useColors()
    const LucideIcon = icons[name]

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

    if (!LucideIcon) {
        console.warn(`Icon with name "${name}" not found`)
        return null
    }

    return (
        <LucideIcon
            size={size}
            color={getIconColor()}
            className={cn('select-none', className)}
            style={[
                {
                    opacity: disabled ? disabledOpacity : 1
                },
                style
            ]}
            strokeWidth={strokeWidth}
            fill={fill}
        />
    )
})

Icon.displayName = 'Icon'