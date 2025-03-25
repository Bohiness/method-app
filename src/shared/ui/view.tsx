// src/shared/ui/view/view.tsx
import { useColors, useTheme } from '@shared/context/theme-provider'
import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { logger } from '@shared/lib/logger/logger.service'
import { cn } from '@shared/lib/utils/cn'
import React, { forwardRef, useEffect, useState } from 'react'
import { View as RNView, ViewProps as RNViewProps, StyleProp, Text, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ModalHeader } from './modals/ModalHeader'

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

const getVariantClasses = (variant: ViewVariant) => {
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
export const OutlinedView = ({ className, ...props }: ViewProps) => (
    <View
        variant="outline"
        className={cn('border border-border dark:border-border-dark rounded-lg', className)}
        {...props}
    />
)

export const ModalBottomContentView = ({ className, variant = 'default', showHeader = false, title, fullScreen = false, ...props }: ViewProps & { showHeader?: boolean, title?: string, fullScreen?: boolean }) => {
    const insets = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight } = useKeyboard()
    const [height, setHeight] = useState<number>(0)
    const [marginBottom, setMarginBottom] = useState<number>(0)

    useEffect(() => {
        logger.log(height, 'element modals height', 'ModalBottomContentView')
        if (height > 803) {
            logger.log('height > 803', 'ModalBottomContentView')
            setMarginBottom(80)
        } else {
            setMarginBottom(0)
        }
    }, [height])

    return (
        <View
            className={cn('relative flex-1', className)}
            variant={variant}
            style={{ paddingBottom: isKeyboardVisible ? keyboardHeight : insets.bottom + marginBottom }}
            onLayout={(event) => {
                const { height } = event.nativeEvent.layout
                setHeight(height)
            }}
            {...props}
        >
            {showHeader && <ModalHeader title={title} showHeader={showHeader} />}
            {props.children}
            {(__DEV__) && (
                <View className="absolute top-0 right-0 bg-surface-paper dark:bg-surface-paper-dark px-2 py-1 rounded-bl-md opacity-70">
                    <Text className="text-xs text-muted-foreground">{Math.round(height)}px</Text>
                </View>
            )}
        </View>
    )
}

export const ModalFullScreenView = ({ className, variant = 'default', showHeader = false, title, fullScreen = false, ...props }: ViewProps & { showHeader?: boolean, title?: string, fullScreen?: boolean }) => {
    const insets = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight } = useKeyboard()

    return (
        <View
            className={cn('flex-1', className)}
            variant={variant}
            style={{ paddingBottom: isKeyboardVisible ? keyboardHeight : insets.bottom }}
            {...props}
        >
            {showHeader && <ModalHeader title={title} />}
            {props.children}
        </View>
    )
}