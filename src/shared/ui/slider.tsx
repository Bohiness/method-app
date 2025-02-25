// src/shared/ui/slider/Slider.tsx
import { Slider as RNSlider } from '@miblanchard/react-native-slider'
import { useColorScheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { Text } from './text'

type Range = {
    range: [number, number]
    value: number
}

interface SliderProps {
    /**
     * Начальное значение слайдера.
     */
    defaultValue?: number
    /**
     * Callback, который вызывается по завершении перемещения слайдера.
     */
    onSlidingComplete?: (value: number) => void
    onValueChange?: (value: number) => void
    minimumValue?: number
    maximumValue?: number
    step?: number
    disabled?: boolean
    className?: string
    /**
     * Можно передать набор диапазонов, чтобы встроить логику переключения (например, для haptic отклика)
     */
    ranges?: Range[]
    /**
     * Текст слева под слайдером
     */
    leftLabel?: string
    /**
     * Текст справа под слайдером
     */
    rightLabel?: string
    /**
     * Дополнительные стили для контейнера лейблов
     */
    labelsContainerClassName?: string
}

export const Slider: React.FC<SliderProps> = ({
    defaultValue = 50,
    onSlidingComplete,
    onValueChange,
    minimumValue = 0,
    maximumValue = 100,
    step = 1,
    disabled = false,
    className = '',
    ranges,
    leftLabel,
    rightLabel,
    labelsContainerClassName,
}) => {
    const colorScheme = useColorScheme()
    const [sound, setSound] = useState<Audio.Sound>()
    // Внутреннее состояние для значения слайдера.
    const [value, setValue] = useState(defaultValue)
    // Определяем текущий диапазон по умолчанию, если переданы ranges.
    const [currentRange, setCurrentRange] = useState<number | null>(() => {
        if (ranges && ranges.length > 0) {
            const found = ranges.find(range => defaultValue >= range.range[0] && defaultValue <= range.range[1])
            return found ? found.value : null
        }
        return null
    })

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    const loadSound = async () => {
        try {
            const { sound: loadedSound } = await Audio.Sound.createAsync(
                require('@assets/sounds/tap.mp3')
            )
            setSound(loadedSound)
        } catch (error) {
            console.error('Error loading sound:', error)
        }
    }

    const playFeedback = async () => {
        try {
            await sound?.playFromPositionAsync(0)
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        } catch (error) {
            console.error('Error playing feedback:', error)
        }
    }

    // Добавляем ref для хранения времени последнего вызова haptic-отклика
    const lastHapticTime = useRef<number>(0)

    // Функция для haptic-отклика с ограничением частоты вызовов (не чаще 300 мс)
    const triggerHaptic = useCallback(async () => {
        const now = Date.now()
        if (now - lastHapticTime.current < 300) {
            return
        }
        lastHapticTime.current = now
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        } catch (error) {
            console.log('Haptic feedback not available', error)
        }
    }, [])

    // Обновляем текущий диапазон и триггерим haptic, если диапазон изменился
    const updateCurrentRange = useCallback(
        (newValue: number) => {
            if (ranges && ranges.length > 0) {
                const newRange = ranges.find(range => newValue >= range.range[0] && newValue <= range.range[1])
                if (newRange && newRange.value !== currentRange) {
                    setCurrentRange(newRange.value)
                    triggerHaptic()
                }
            }
        },
        [ranges, currentRange, triggerHaptic]
    )

    // При изменении значения слайдера обновляем состояние и вызываем onValueChange сразу
    const handleValueChange = useCallback(
        (values: number[]) => {
            const newValue = values[0]
            setValue(newValue)
            updateCurrentRange(newValue)
            onValueChange?.(newValue)
        },
        [updateCurrentRange, onValueChange]
    )

    // По завершении перемещения слайдера вызываем callback родителя
    const handleSlidingComplete = useCallback(
        (values: number[]) => {
            const newValue = values[0]
            setValue(newValue)
            updateCurrentRange(newValue)
            onSlidingComplete?.(newValue)
            onValueChange?.(newValue)
            playFeedback()
        },
        [onSlidingComplete, updateCurrentRange, onValueChange, playFeedback]
    )

    const sliderColors = {
        light: {
            track: '#E5E7EB',
            activeTrack: '#A3A3A3',
            thumb: '#1A1A1A',
        },
        dark: {
            track: '#4B5563',
            activeTrack: '#F8F9FA',
            thumb: '#FFFFFF',
        },
    }

    return (
        <View className={className}>
            <View className="px-6">
                <RNSlider
                    value={[value]}
                    onValueChange={handleValueChange}
                    onSlidingComplete={handleSlidingComplete}
                    minimumValue={minimumValue}
                    maximumValue={maximumValue}
                    step={step}
                    disabled={disabled}
                    trackStyle={{
                        height: 24,
                        borderRadius: 30,
                    }}
                    minimumTrackTintColor={sliderColors[colorScheme].activeTrack}
                    minimumTrackStyle={{
                        borderTopLeftRadius: 30,
                        borderBottomLeftRadius: 30,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                    }}
                    maximumTrackTintColor={sliderColors[colorScheme].track}
                    thumbStyle={{
                        width: 24,
                        height: 24,
                        backgroundColor: sliderColors[colorScheme].thumb,
                        borderRadius: 30,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    }}
                    thumbTouchSize={{ width: 40, height: 40 }}
                    animateTransitions
                    containerStyle={{ zIndex: 1 }}
                />
            </View>

            {/* Вывод лейблов под слайдером */}
            {(leftLabel || rightLabel) && (
                <View className={cn('flex-row justify-between px-8 mt-2', labelsContainerClassName)}>
                    {leftLabel && (
                        <Text variant="secondary" size="sm" className="text-secondary-light dark:text-secondary-light-dark">
                            {leftLabel}
                        </Text>
                    )}
                    {rightLabel && (
                        <Text variant="secondary" size="sm" className="text-secondary-light dark:text-secondary-light-dark">
                            {rightLabel}
                        </Text>
                    )}
                </View>
            )}
        </View>
    )
}