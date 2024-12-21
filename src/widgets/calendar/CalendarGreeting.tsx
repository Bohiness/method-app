import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Separator } from '@shared/ui/separator'
import { HapticTab } from '@shared/ui/system/HapticTab'
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
    const { t } = useTranslation('calendar')
    const scrollViewRef = useRef<ScrollView>(null)

    const dates = eachDayOfInterval({
        start: subDays(new Date(), 7),
        end: addDays(new Date(), 1),
    })

    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate)
    }


    // Функция для определения текста даты
    const getDateText = (date: Date): string => {
        const today = new Date()
        const tomorrow = addDays(today, 1)
        const yesterday = subDays(today, 1)

        // Используем isSameDay вместо сравнения строк
        if (isSameDay(date, today)) {
            return getGreeting()
        }
        if (isSameDay(date, yesterday)) {
            return t('yesterday')
        }
        if (isSameDay(date, tomorrow)) {
            return t('tomorrow')
        }
        return formatDateTime(date, 'dd MMMM')
    }

    useEffect(() => {
        // Небольшая задержка для уверенности, что компонент отрендерился
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false })
        }, 100)
    }, [])

    return (
        <View className="px-4">
            {/* Приветствие */}
            <View className="py-2 mb-2">
                <Text size="2xl" weight="bold" className="text-center">
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
                                    w-14 h-16 
                                    flex items-center justify-end 
                                    rounded-xl border p-2
                                    ${isSelected ?
                                        'border-1 border-light-text/20 dark:border-dark-text/30' :
                                        'border border-transparent'}
                                    ${isToday ?
                                        'bg-light-text/10 dark:bg-dark-text/10' : ''}
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
                                    size="lg"
                                    variant={isSelected || isToday ? 'default' : 'secondary'}
                                >
                                    {format(date, 'd')}
                                </Text>
                            </HapticTab>
                        )
                    })}
                </View>
            </ScrollView>

            <Separator className='my-4' />

            {/* Заменяем старый блок с деталями на новый свайпабельный компонент */}
            <CarouselDayDetails
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                formatDateTime={formatDateTime}
            />
        </View>
    )
}

export default CalendarGreeting