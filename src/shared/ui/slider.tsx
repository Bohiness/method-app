// src/shared/ui/slider/Slider.tsx
import { Slider as RNSlider } from '@miblanchard/react-native-slider'
import { useColorScheme } from '@shared/context/theme-provider'
import React, { useCallback, useState } from 'react'
import { View } from 'react-native'

interface SliderProps {
    value: number
    onValueChange?: (value: number) => void
    onSlidingComplete?: (value: number) => void
    minimumValue?: number
    maximumValue?: number
    step?: number
    disabled?: boolean
    className?: string
}

export const Slider: React.FC<SliderProps> = ({
    value,
    onValueChange,
    onSlidingComplete,
    minimumValue = 0,
    maximumValue = 100,
    step = 1,
    disabled = false,
    className = '',
}) => {
    const colorScheme = useColorScheme()
    const [lastChangeTime, setLastChangeTime] = useState(0)

    const handleValueChange = useCallback(
        (values: number[]) => {
            const now = Date.now()
            const newValue = values[0]

            // Пропускаем слишком частые обновления
            if (now - lastChangeTime < 100) {
                return
            }

            setLastChangeTime(now)
            onValueChange?.(newValue)
        },
        [onValueChange, lastChangeTime]
    )

    // Добавляем обработчик завершения скольжения
    const handleSlidingComplete = useCallback(
        (values: number[]) => {
            onSlidingComplete?.(values[0])
        },
        [onSlidingComplete]
    )

    const colors = {
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
        <View className={`px-6 ${className}`}>
            <RNSlider
                value={value}
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
                minimumTrackTintColor={colors[colorScheme].activeTrack}
                minimumTrackStyle={{
                    borderTopLeftRadius: 30,
                    borderBottomLeftRadius: 30,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                }}
                maximumTrackTintColor={colors[colorScheme].track}
                thumbStyle={{
                    width: 24,
                    height: 24,
                    backgroundColor: colors[colorScheme].thumb,
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
                animateTransitions={true}

            />
        </View>
    )
}