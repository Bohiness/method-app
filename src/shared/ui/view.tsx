// src/shared/ui/view/view.tsx
import { useColors, useColorScheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import React from 'react'
import { View as RNView, ViewProps as RNViewProps } from 'react-native'

export type ViewVariant =
    | 'default'
    | 'paper'    // Для карточек и возвышенных элементов
    | 'canvas'   // Для фоновых элементов
    | 'stone'    // Для выделенных элементов
    | 'inverse'  // Инвертированный цвет относительно темы

interface ViewProps extends RNViewProps {
    variant?: ViewVariant
    className?: string
    children?: React.ReactNode
}

const getVariantClasses = (variant: ViewVariant) => {
    const variants = {
        default: 'bg-background dark:bg-background',
        paper: 'bg-surface-paper dark:bg-surface-paper',
        canvas: 'bg-surface-canvas dark:bg-surface-canvas',
        stone: 'bg-surface-stone dark:bg-surface-stone',
        inverse: 'bg-text dark:bg-background'
    }
    return variants[variant]
}

export const View: React.FC<ViewProps> = ({
    variant = 'default',
    className,
    style,
    children,
    ...props
}) => {
    const colorScheme = useColorScheme()
    const colors = useColors()

    return (
        <RNView
            className={cn(getVariantClasses(variant), className)}
            style={[
                {
                    backgroundColor: variant === 'default'
                        ? colors.background
                        : variant === 'paper'
                            ? colors.surface.paper
                            : variant === 'canvas'
                                ? colors.surface.canvas
                                : variant === 'stone'
                                    ? colors.surface.stone
                                    : variant === 'inverse'
                                        ? colorScheme === 'dark' ? colors.background : colors.text
                                        : undefined
                },
                style
            ]}
            {...props}
        >
            {children}
        </RNView>
    )
}

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
        className={cn('px-4 py-2 flex-1', className)}
        {...props}
    />
)

// Компонент с тенью
export const ElevatedView = ({ className, style, ...props }: ViewProps) => (
    <View
        variant="paper"
        className={cn('rounded-lg', className)}
        style={[
            {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            },
            style
        ]}
        {...props}
    />
)

// Компонент с границей
export const BorderedView = ({ className, ...props }: ViewProps) => (
    <View
        variant="default"
        className={cn('border border-border dark:border-border-dark rounded-lg', className)}
        {...props}
    />
)