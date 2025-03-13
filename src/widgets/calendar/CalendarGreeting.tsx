// src/widgets/calendar/CalendarGreeting.tsx
import { DateScrollPicker } from '@entities/calendar/date-scroll-picker'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Separator } from '@shared/ui/separator'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import CarouselDayDetails from './CarouselDayDetails'

const CalendarGreeting = () => {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const { formateDataTimeWithTimezoneAndLocale } = useDateTime()

    useEffect(() => {
        router.setParams({ selectedDate: selectedDate?.toISOString() || '' })
    }, [selectedDate])

    return (
        <View className="gap-y-4">
            {/* Календарь */}
            <DateScrollPicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                daysBack={7}
                daysForward={1}
            />

            <Separator />

            {/* Карусель с деталями дня */}
            <CarouselDayDetails
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                formatDateTime={formateDataTimeWithTimezoneAndLocale}
            />
        </View>
    )
}

export default CalendarGreeting