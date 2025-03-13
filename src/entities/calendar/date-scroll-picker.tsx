// src/shared/ui/date-scroll-picker/date-scroll-picker.tsx
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Text } from '@shared/ui/text'
import { addDays, eachDayOfInterval, format, isSameDay, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import React, { useEffect, useRef } from 'react'
import { ScrollView, View } from 'react-native'

interface DateScrollPickerProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
    daysBack?: number
    daysForward?: number
    autoScroll?: boolean
    className?: string
    scrollToEndEnabled?: boolean
}

export const DateScrollPicker: React.FC<DateScrollPickerProps> = ({
    selectedDate,
    onDateChange,
    daysBack = 7,
    daysForward = 1,
    autoScroll = true,
    className = '',
    scrollToEndEnabled = true
}) => {
    const scrollViewRef = useRef<ScrollView>(null)

    const dates = eachDayOfInterval({
        start: subDays(new Date(), daysBack),
        end: addDays(new Date(), daysForward),
    })

    useEffect(() => {
        if (autoScroll) {
            scrollToEndEnabled
                ? setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: false })
                }, 100)
                : scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false })
        }
    }, [autoScroll, scrollToEndEnabled])

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className={`flex-row ${className}`}
            ref={scrollViewRef}
            contentContainerStyle={{
                paddingLeft: 'auto',
                flexGrow: 1,
                justifyContent: 'flex-end'
            }}
        >
            <View className="flex-row items-center space-x-2">
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, new Date())

                    return (
                        <HapticTab
                            key={date.toString()}
                            onPress={() => onDateChange(date)}
                            className={`
                                flex h-16 w-14 items-center justify-end 
                                rounded-xl border p-2
                                ${isSelected ? 'border-border dark:border-border-dark' : 'border-transparent'}
                                ${isToday ? 'bg-surface-paper dark:bg-surface-paper-dark' : ''}
                            `}
                        >
                            <Text
                                variant="secondary"
                                size="xs"
                                className="mb-1 text-center"
                            >
                                {format(date, 'eeeeee', { locale: ru })}
                            </Text>

                            <Text
                                variant={isSelected || isToday ? 'default' : 'secondary'}
                                size="lg"
                            >
                                {format(date, 'd')}
                            </Text>
                        </HapticTab>
                    )
                })}
            </View>
        </ScrollView>
    )
}