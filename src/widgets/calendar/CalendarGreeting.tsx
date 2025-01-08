import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Separator } from '@shared/ui/separator'
import { Text } from '@ui/styled-text'
import { addDays, eachDayOfInterval, format, isSameDay, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import CarouselDayDetails from './CarouselDayDetails'

const CalendarGreeting = () => {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const { getGreeting, formatDateTime } = useDateTime()
    const { t } = useTranslation()
    const scrollViewRef = useRef<ScrollView>(null)

    const dates = eachDayOfInterval({
        start: subDays(new Date(), 7),
        end: addDays(new Date(), 1),
    })

    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate)
    }

    const getDateText = (date: Date): string => {
        const today = new Date()
        const tomorrow = addDays(today, 1)
        const yesterday = subDays(today, 1)

        if (isSameDay(date, today)) {
            return getGreeting()
        }
        if (isSameDay(date, yesterday)) {
            return t('calendar.yesterday')
        }
        if (isSameDay(date, tomorrow)) {
            return t('calendar.tomorrow')
        }
        return formatDateTime(date, 'dd MMMM')
    }

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false })
        }, 100)
    }, [])

    return (
        <View className="space-y-4 px-4">
            {/* Приветствие */}
            <View className="py-2">
                <Text
                    size="2xl"
                    weight="bold"
                    variant="default"
                    className="text-center"
                >
                    {getDateText(selectedDate)}.
                </Text>
            </View>

            {/* Календарь */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
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
                                onPress={() => handleDateChange(date)}
                                className={`
                                    flex h-16 w-14 items-center justify-end 
                                    rounded-xl border p-2
                                    ${isSelected ? 'border-text/20 dark:border-text-dark/20' : 'border-transparent'}
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

            <Separator className='my-4' />

            {/* Карусель с деталями дня */}
            <CarouselDayDetails
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                formatDateTime={formatDateTime}
            />
        </View>
    )
}

export default CalendarGreeting