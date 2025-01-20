// src/shared/ui/time-picker/index.tsx
import DateTimePicker from '@react-native-community/datetimepicker'
import { useColors } from '@shared/context/theme-provider'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { cn } from '@shared/lib/utils/cn'
import React, { useCallback, useState } from 'react'
import { Modal, Platform, Pressable, View as RNView } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from './button'
import { Text } from './text'
import { View } from './view'

interface TimePickerProps {
    value: Date
    onChange: (hours: number, minutes: number) => void
    format?: '12h' | '24h'
    minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30
    className?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const TimePicker: React.FC<TimePickerProps> = ({
    value,
    onChange,
    format = '24h',
    minuteInterval = 1,
    className
}) => {
    const colors = useColors()
    const { formatDateTime } = useDateTime()
    const [tempDate, setTempDate] = useState(value)
    const [isVisible, setIsVisible] = useState(false)

    const handleConfirm = useCallback(() => {
        onChange(tempDate.getHours(), tempDate.getMinutes())
        setIsVisible(false)
    }, [tempDate, onChange])

    const handleCancel = useCallback(() => {
        setTempDate(value)
        setIsVisible(false)
    }, [value])

    const handleChange = useCallback((_: any, date?: Date) => {
        if (date) {
            setTempDate(date)
        }
    }, [])

    if (Platform.OS === 'ios') {
        return (
            <View className={className}>
                <Modal
                    visible={isVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={handleCancel}
                >
                    <RNView className="flex-1 justify-end">
                        <RNView>
                            <RNView className="flex-row justify-between items-center px-4 py-2">
                                <Button
                                    variant="ghost"
                                    onPress={handleCancel}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="ghost"
                                    onPress={handleConfirm}
                                >
                                    Готово
                                </Button>
                            </RNView>

                            {/* Пикер */}
                            <DateTimePicker
                                value={tempDate}
                                mode="time"
                                display="spinner"
                                onChange={handleChange}
                                minuteInterval={minuteInterval}
                                is24Hour={format === '24h'}
                                textColor={colors.text}
                            />
                        </RNView>
                    </RNView>
                </Modal>

                <Pressable
                    onPress={() => setIsVisible(true)}
                    className={cn(
                        "flex-row items-center justify-center py-2 px-4 rounded-full",
                    )}
                >
                    <Text className="text-lg">
                        {formatDateTime(value, format === '12h' ? 'hh:mm a' : 'HH:mm')}
                    </Text>
                </Pressable>
            </View>
        )
    }

    // Android версия (можно кастомизировать под дизайн iOS)
    return (
        <DateTimePicker
            value={value}
            mode="time"
            is24Hour={format === '24h'}
            onChange={(event, date) => {
                if (event.type === 'set' && date) {
                    onChange(date.getHours(), date.getMinutes())
                }
            }}
            minuteInterval={minuteInterval}
        />
    )
}