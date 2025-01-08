import { useLanguage } from '@shared/context/language-provider'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { ProcessedMoodStats } from '@shared/types/diary/stats/statsType'
import { Text } from '@shared/ui/styled-text'
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns'
import React, { useMemo } from 'react'
import { View } from 'react-native'

const DAYS_OF_WEEK = {
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

const DAYS_IN_WEEK = 7


interface MonthlyActivityProps {
    currentMonthData: ProcessedMoodStats['monthlyData']
}

export const MonthlyActivity = ({ currentMonthData }: MonthlyActivityProps) => {
    const { currentLanguage } = useLanguage()
    const { formatDateTime } = useDateTime()

    const calendarData = useMemo(() => {
        const today = new Date()
        const monthStart = startOfMonth(today)
        const monthEnd = endOfMonth(today)
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

        // Получаем день недели для первого дня месяца (0 = воскресенье, 1 = понедельник)
        let firstDayOfWeek = getDay(monthStart)
        // Корректируем для недели, начинающейся с понедельника
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

        // Добавляем пустые дни в начало для выравнивания
        const paddingDays = Array(firstDayOfWeek).fill(null)
        const allDays = [...paddingDays, ...days]

        // Добавляем пустые дни в конец для полных недель
        const remainingDays = (DAYS_IN_WEEK - (allDays.length % DAYS_IN_WEEK)) % DAYS_IN_WEEK
        const paddingEndDays = Array(remainingDays).fill(null)

        // Формируем полные недели
        const fullCalendar = [...allDays, ...paddingEndDays]
        const weeks = []
        for (let i = 0; i < fullCalendar.length; i += DAYS_IN_WEEK) {
            weeks.push(fullCalendar.slice(i, i + DAYS_IN_WEEK))
        }

        return weeks
    }, [])

    const getDayMood = (date: Date | null): number | undefined => {
        if (!date) return undefined
        const formattedDate = format(date, 'yyyy-MM-dd')
        const dayData = currentMonthData?.current?.find(point => point.date === formattedDate)
        return dayData?.avg_mood
    }

    const getCircleStyle = (date: Date | null) => {
        if (!date) return 'bg-transparent'
        const today = new Date('2025-01-04T02:43:07+08:00')
        const formattedDate = format(date, 'yyyy-MM-dd')
        const formattedToday = format(today, 'yyyy-MM-dd')
        const isToday = formattedDate === formattedToday
        const hasMood = currentMonthData?.current?.some(point => point.date === formattedDate) || false

        if (isToday) return 'bg-tint'
        if (hasMood) return 'bg-tint'
        return 'bg-zinc-900'
    }

    const getTextStyle = (date: Date | null) => {
        if (!date) return 'text-transparent'
        const formattedDate = format(date, 'yyyy-MM-dd')
        const hasMood = currentMonthData?.current?.some(point => point.date === formattedDate)

        if (hasMood) return 'text-white'
        return 'text-zinc-400'
    }

    return (
        <View className="w-full p-4">
            <Text className={`
                text-center text-base font-semibold mb-4
                text-secondary/60 dark:text-secondary-dark/60
            `}>
                {formatDateTime(new Date(), 'LLLL yyyy')}
            </Text>

            <View className="flex-row justify-between mb-4">
                {DAYS_OF_WEEK[currentLanguage as 'ru' | 'en'].map(day => (
                    <View key={day} className="w-10 items-center">
                        <Text className="text-sm text-zinc-400">{day}</Text>
                    </View>
                ))}
            </View>

            {calendarData.map((week, weekIndex) => (
                <View key={weekIndex} className="flex-row justify-between mb-2">
                    {week.map((day, dayIndex) => (
                        <View
                            key={`${weekIndex}-${dayIndex}`}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${getCircleStyle(day)}`}>
                                <Text className={`text-sm ${getTextStyle(day)}`}>
                                    {day ? (getDayMood(day)?.toFixed(1) || format(day, 'd')) : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    )
}