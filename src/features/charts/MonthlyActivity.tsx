import { useLanguage } from '@shared/context/language-provider'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { ProcessedMoodStats } from '@shared/types/diary/stats/statsType'
import { Calendar } from '@shared/ui/calendar'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { format } from 'date-fns'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface MonthlyActivityProps {
    currentMonthData: ProcessedMoodStats['monthlyData']
}

export const MonthlyActivity = ({ currentMonthData }: MonthlyActivityProps) => {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()
    const { formatDateTime } = useDateTime()
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Подготавливаем данные для маркеров календаря
    const markedDates = useMemo(() => {
        if (!currentMonthData?.current) return {}

        return currentMonthData.current.reduce((acc, point) => {
            const getMoodColor = (value: number) => {
                if (value >= 4) return '#22C55E' // Хорошее настроение
                if (value >= 2.5) return '#F59E0B' // Нейтральное
                return '#E53E3E' // Плохое настроение
            }

            const dateKey = format(point.date, 'yyyy-MM-dd') as `${number}-${number}-${number}`

            acc[dateKey] = {
                marked: true,
                dotColor: getMoodColor(point.value),
                data: {
                    moodValue: point.value,
                    count: point.count
                }
            }

            return acc
        }, {} as Record<`${number}-${number}-${number}`, {
            marked: boolean
            dotColor: string
            data: {
                moodValue: number
                count: number
            }
        }>)
    }, [currentMonthData?.current])

    const renderDay = (props: {
        date: Date
        isSelected: boolean
        isToday: boolean
        isCurrentMonth: boolean
        isDisabled: boolean
        marked?: { data?: { moodValue: number; count: number } }
    }) => {
        const dateKey = format(props.date, 'yyyy-MM-dd') as `${number}-${number}-${number}`
        const moodData = markedDates[dateKey]?.data

        if (moodData) {
            return (
                <View className="items-center justify-center h-full">
                    <Text
                        className={`text-sm ${props.isSelected
                            ? "text-background dark:text-background-dark"
                            : "text-text dark:text-text-dark"
                            }`}
                    >
                        {moodData.moodValue.toFixed(1)}
                    </Text>
                    <Text
                        className={`text-xs ${props.isSelected
                            ? "text-background/70 dark:text-background-dark/70"
                            : "text-secondary-light dark:text-secondary-light-dark"
                            }`}
                    >
                        {moodData.count}x
                    </Text>
                </View>
            )
        }

        return (
            <Text
                className={`${props.isSelected
                    ? "text-background dark:text-background-dark"
                    : props.isCurrentMonth
                        ? "text-text dark:text-text-dark"
                        : "text-secondary-light dark:text-secondary-light-dark"
                    }`}
            >
                {format(props.date, 'd')}
            </Text>
        )
    }

    return (
        <View className="w-full">
            <Text className="text-center text-base font-semibold mb-4 text-secondary-light dark:text-secondary-light-dark">
                {formatDateTime(selectedDate, 'LLLL yyyy')}
            </Text>

            <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                disableSelection={true}
                markedDates={markedDates}
                weekStartsOn={currentLanguage === 'ru' ? 1 : 0}
                showMonthNavigation={true}
                textStyles={{
                    weekDayText: "text-xs font-medium text-secondary-light dark:text-secondary-light-dark"
                }}
                renderDay={renderDay}
                title={false}
            />

            {!currentMonthData.current.length && (
                <Text
                    className="text-center mt-4 text-secondary-light dark:text-secondary-light-dark"
                >
                    {t('common.charts.noData')}
                </Text>
            )}
        </View>
    )
}