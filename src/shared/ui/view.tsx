// src/shared/ui/view/view.tsx
import { useColors, useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import React, { forwardRef } from 'react'
import { View as RNView, ViewProps as RNViewProps, StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type ViewVariant =
    | 'default'
    | 'paper'    // Для карточек и возвышенных элементов
    | 'canvas'   // Для фоновых элементов
    | 'stone'    // Для выделенных элементов
    | 'inverse'  // Инвертированный цвет относительно темы
    | 'transparent' // Прозрачный цвет
    | 'outline' // Для границ
    | 'secondary' // Для вторичных элементов

export interface ViewProps extends RNViewProps {
    variant?: ViewVariant
    className?: string
    children?: React.ReactNode
    style?: StyleProp<ViewStyle>
}

export const getVariantClasses = (variant: ViewVariant) => {
    const variants = {
        default: 'bg-background dark:bg-background-dark',
        paper: 'bg-surface-paper dark:bg-surface-paper-dark',
        canvas: 'bg-surface-canvas dark:bg-surface-canvas-dark',
        stone: 'bg-surface-stone dark:bg-surface-stone-dark',
        inverse: 'bg-background-dark dark:bg-background',
        transparent: 'bg-transparent dark:bg-transparent',
        outline: 'bg-transparent dark:bg-transparent border border-border dark:border-border-dark',
        secondary: 'bg-surface-secondary dark:bg-surface-secondary-dark'
    }
    return variants[variant]
}

export const View = forwardRef<RNView, ViewProps>(({
    variant = 'transparent',
    className,
    style,
    children,
    ...props
}, ref) => {
    const { colors, isDark } = useTheme()

    return (
        <RNView
            ref={ref}
            className={cn(getVariantClasses(variant), className)}
            style={style}
            {...props}
        >
            {children}
        </RNView>
    )
})

// Предустановленные компоненты для частых случаев использования
export const Card = ({ className, ...props }: ViewProps) => (
    <View
        variant="paper"
        className={cn('rounded-2xl p-4', className)}
        {...props}
    />
)

export const Surface = ({ className, ...props }: ViewProps) => (
    <View
        variant="canvas"
        className={cn('rounded-lg', className)}
        {...props}
    />
)

export const Container = ({ className, ...props }: ViewProps) => (
    <View
        variant="default"
        className={cn('px-4 py-2 flex-1 relative', className)}
        {...props}
    />
)

export const ContainerWithSafeArea = ({ className, ...props }: ViewProps) => {
    const insets = useSafeAreaInsets()
    return (
        <View
            variant="default"
            className={cn(`px-4 py-2 flex-1`, className)}
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
            {...props}
        />
    )
}

// Добавляем новый компонент для основного контейнера
export const ContainerScreen = ({ className, style, children, ...props }: ViewProps) => {
    const colors = useColors()

    return (
        <View
            variant="default"
            className={cn("flex-1", className)}
            style={[
                {
                    backgroundColor: colors.background
                },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    )
}

// Компонент с границей
export const OutlinedView = ({ className, ...props }: ViewProps) => (
    <View
        variant="outline"
        className={cn('border border-border dark:border-border-dark rounded-lg', className)}
        {...props}
    />
)