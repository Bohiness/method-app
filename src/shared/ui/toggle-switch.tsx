import { cn } from '@shared/lib/utils/cn'
import { Text } from '@shared/ui/text'
import React, { useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, View } from 'react-native'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated'

interface ToggleSwitchProps {
    // Основные пропсы
    leftLabel?: string
    rightLabel?: string
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean

    // Пропсы для стилизации
    className?: string               // Классы для всего компонента
    containerClassName?: string      // Классы для контейнера переключателя
    backgroundClassName?: string     // Классы для фона
    thumbClassName?: string          // Классы для ползунка
    labelClassName?: string          // Классы для текста
    activeLabelClassName?: string    // Классы для активного текста
    inactiveLabelClassName?: string  // Классы для неактивного текста

    // Размеры и отступы
    size?: 'sm' | 'md' | 'lg'
    padding?: number
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    // Основные пропсы
    leftLabel = 'Premium',
    rightLabel = 'Premium + AI',
    value,
    onChange,
    disabled = false,

    // Классы для стилизации
    className = '',
    containerClassName = '',
    backgroundClassName = '',
    thumbClassName = '',
    labelClassName = '',
    activeLabelClassName = '',
    inactiveLabelClassName = '',

    // Размеры
    size = 'md',
    padding = 16,
}) => {
    const translateX = useSharedValue(value ? 1 : 0)
    const context = useSharedValue({ x: 0 })
    const [width, setWidth] = useState(0)
    const [containerWidth, setContainerWidth] = useState(0)

    // Определяем размеры в зависимости от size
    const sizes = {
        sm: { height: 32, textSize: 'sm' as const },
        md: { height: 40, textSize: 'base' as const },
        lg: { height: 48, textSize: 'lg' as const },
    }

    const currentSize = sizes[size]

    const onTextLayout = useCallback((event: LayoutChangeEvent) => {
        const { width: newWidth } = event.nativeEvent.layout
        setWidth(currentWidth => Math.max(currentWidth, newWidth))
    }, [])

    const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
        const { width: newWidth } = event.nativeEvent.layout
        setContainerWidth(newWidth)
    }, [])

    const updateValue = (newValue: boolean) => {
        if (!disabled && newValue !== value) {
            onChange(newValue)
        }
    }

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { x: translateX.value }
        })
        .onUpdate((event) => {
            const newValue = context.value.x + event.translationX / (containerWidth - (width + padding * 2))
            translateX.value = Math.min(Math.max(newValue, 0), 1)
        })
        .onEnd(() => {
            const finalValue = translateX.value > 0.5
            translateX.value = withSpring(finalValue ? 1 : 0, {
                mass: 0.5,
                damping: 8,
                stiffness: 150,
            })
            runOnJS(updateValue)(finalValue)
        })

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value * (containerWidth - (width + padding * 2)),
            },
        ],
    }))

    const segmentStyle = {
        width: width + padding * 2,
        height: currentSize.height,
    }


    // Отслеживаем изменения пропса value и обновляем положение ползунка
    useEffect(() => {
        translateX.value = withSpring(value ? 1 : 0, {
            mass: 0.5,
            damping: 8,
            stiffness: 150,
        })
    }, [value, translateX])

    return (
        <GestureHandlerRootView className={cn('flex flex-row items-center justify-center', className)}>
            {/* Невидимые элементы для измерения */}
            <View style={{ position: 'absolute', opacity: 0 }}>
                <Text onLayout={onTextLayout}>{leftLabel}</Text>
                <Text onLayout={onTextLayout}>{rightLabel}</Text>
            </View>

            {width > 0 && (
                <View
                    className={cn('flex-row relative', containerClassName)}
                    onLayout={onContainerLayout}
                >
                    {/* Фон */}
                    <View
                        style={[{ width: (width + padding * 2) * 2 }, segmentStyle]}
                        className={cn(
                            'absolute top-0 left-0 rounded-full bg-surface-paper dark:bg-surface-paper-dark',
                            backgroundClassName
                        )}
                    />

                    {/* Ползунок */}
                    <GestureDetector gesture={gesture}>
                        <Animated.View
                            style={[buttonStyle, segmentStyle]}
                            className={cn(
                                'absolute top-0 left-0 rounded-full bg-text dark:bg-text-dark',
                                { 'opacity-50': disabled },
                                thumbClassName
                            )}
                        />
                    </GestureDetector>

                    {/* Контейнер для текста */}
                    <View className="flex-row">
                        {/* Левая часть */}
                        <GestureDetector gesture={Gesture.Tap().onEnd(() => {
                            translateX.value = withSpring(0, {
                                mass: 0.5,
                                damping: 8,
                                stiffness: 150,
                            })
                            runOnJS(updateValue)(false)
                        })}>
                            <View style={segmentStyle} className="items-center justify-center rounded-full">
                                <Text
                                    size={currentSize.textSize}
                                    weight="medium"
                                    className={cn(
                                        'rounded-r-none',
                                        labelClassName,
                                        value ? activeLabelClassName : inactiveLabelClassName,
                                        value
                                            ? 'text-secondary-dark dark:text-text-dark'
                                            : 'text-text-dark dark:text-text'
                                    )}
                                >
                                    {leftLabel}
                                </Text>
                            </View>
                        </GestureDetector>

                        {/* Правая часть */}
                        <GestureDetector gesture={Gesture.Tap().onEnd(() => {
                            translateX.value = withSpring(1, {
                                mass: 0.5,
                                damping: 8,
                                stiffness: 150,
                            })
                            runOnJS(updateValue)(true)
                        })}>
                            <View style={segmentStyle} className="items-center justify-center rounded-full">
                                <Text
                                    size={currentSize.textSize}
                                    weight="medium"
                                    className={cn(
                                        labelClassName,
                                        value ? activeLabelClassName : inactiveLabelClassName,
                                        value
                                            ? 'text-text-dark dark:text-text'
                                            : 'text-secondary-dark dark:text-text-dark'
                                    )}
                                >
                                    {rightLabel}
                                </Text>
                            </View>
                        </GestureDetector>
                    </View>
                </View>
            )}
        </GestureHandlerRootView>
    )
}

export { ToggleSwitch }
