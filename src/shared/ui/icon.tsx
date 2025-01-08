// src/shared/ui/icon/icon.tsx
import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { icons } from 'lucide-react-native'
import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export type IconName = keyof typeof icons

// Типы для вариантов иконок
export type IconVariant =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'accent'
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
    // Инвертировать цвета для темной темы
    invertInDark?: boolean
    // Отключить интерактивность
    disabled?: boolean
    // Opacity для disabled состояния
    disabledOpacity?: number
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
}: IconProps) => {
    const { colors, isDark } = useTheme()
    const LucideIcon = icons[name]

    // Получаем базовые цвета для текущей темы
    const getBaseColors = () => ({
        default: colors.text,
        primary: colors.tint,
        secondary: colors['secondary-light'],
        accent: isDark ? colors.tint : colors.inactive,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        tint: colors.tint,
        muted: colors.inactive,
    })

    // Инвертированные цвета для темной темы
    const getInvertedColors = () => ({
        default: isDark ? colors.background : colors.text,
        primary: isDark ? colors.background : colors.tint,
        secondary: isDark ? colors.background : colors['secondary-light'],
        accent: isDark ? colors.background : colors.tint,
        success: isDark ? colors.background : colors.success,
        error: isDark ? colors.background : colors.error,
        warning: isDark ? colors.background : colors.warning,
        tint: isDark ? colors.background : colors.tint,
        muted: isDark ? colors.background : colors.inactive,
    })

    // Определяем финальный цвет иконки
    const getIconColor = () => {
        // Если передан явный цвет - используем его
        if (color) return color

        // Получаем цвета в зависимости от инверсии
        const variantColors = invertInDark ? getInvertedColors() : getBaseColors()

        // Получаем цвет для текущего варианта
        const variantColor = variantColors[variant]

        // Применяем прозрачность если иконка отключена
        if (disabled) {
            return variantColor + Math.round(disabledOpacity * 255).toString(16)
        }

        return variantColor
    }

    // Добавляем проверку на существование иконки
    const IconComponent = icons[name]
    if (!IconComponent) {
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
        />
    )
})