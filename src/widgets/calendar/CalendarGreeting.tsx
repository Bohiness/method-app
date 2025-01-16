// src/widgets/calendar/CalendarGreeting.tsx
import { DateScrollPicker } from '@entities/calendar/date-scroll-picker'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Separator } from '@shared/ui/separator'
import { Text } from '@shared/ui/text'
import { addDays, isSameDay, subDays } from 'date-fns'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import CarouselDayDetails from './CarouselDayDetails'

const CalendarGreeting = () => {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const { getGreeting, formatDateTime } = useDateTime()
    const { t } = useTranslation()

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

    return (
        <View className="space-y-4 px-4">
            {/* Приветствие */}
            <View className="mb-4">
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
            <DateScrollPicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                daysBack={7}
                daysForward={1}
            />

            <Separator className='my-4' />

            {/* Карусель с деталями дня */}
            <CarouselDayDetails
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                formatDateTime={formatDateTime}
            />
        </View>
    )
}

export default CalendarGreeting