import { useColors, useTheme } from '@shared/context/theme-provider'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { cn } from '@shared/lib/utils/cn'
import {
    addMonths,
    eachDayOfInterval,
    eachWeekOfInterval,
    endOfMonth,
    endOfWeek,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Pressable, View as RNView } from 'react-native'
import { Button } from './button'
import { OpenTimePicker } from './open-time-picker'
import { Text } from './text'
import { View } from './view'

// Интерфейсы для стилизации
export interface CalendarStyles {
    container?: string
    header?: string
    weekDays?: string
    weekNumber?: string
    day?: string
    selectedDay?: string
    todayDay?: string
    outsideMonthDay?: string
    disabledDay?: string
    markedDot?: string
    timePicker?: string
}

export interface CalendarTextStyles {
    headerText?: string
    weekDayText?: string
    weekNumberText?: string
    dayText?: string
    selectedDayText?: string
    todayDayText?: string
    outsideMonthDayText?: string
    disabledDayText?: string
}

export interface CalendarProps {
    value: Date
    onChange: (date: Date) => void
    minDate?: Date
    maxDate?: Date
    markedDates?: {
        [key: string]: {
            dotColor?: string
            marked?: boolean
        }
    }
    showMonthNavigation?: boolean
    showTimePicker?: boolean
    timeFormat?: '12h' | '24h'
    minuteInterval?: number
    showWeekNumbers?: boolean
    weekStartsOn?: 0 | 1
    className?: string
    title?: boolean
    styles?: CalendarStyles
    textStyles?: CalendarTextStyles
    disableSelection?: boolean
}

export const Calendar = ({
    value,
    onChange,
    minDate,
    maxDate,
    markedDates,
    disableSelection = false,
    showMonthNavigation = false,
    showTimePicker = false,
    timeFormat = '24h',
    minuteInterval = 1,
    showWeekNumbers = false,
    weekStartsOn = 1,
    className,
    title = true,
    styles = {},
    textStyles = {}
}: CalendarProps) => {
    const { isDark } = useTheme()
    const colors = useColors()
    const { formateDataTimeWithTimezoneAndLocale } = useDateTime()
    const [currentDate, setCurrentDate] = useState<Date>(value)
    const isMounted = useRef(false)

    useLayoutEffect(() => {
        if (value && !isEqual(value, currentDate)) {
            setCurrentDate(value)
        }
    }, [value])

    // Объединяем дефолтные стили с пользовательскими
    const defaultStyles: CalendarStyles = {
        container: "rounded-2xl p-4",
        header: "flex-row items-center justify-between mb-4",
        weekDays: "flex-row mb-2",
        weekNumber: "w-8 items-center justify-center",
        day: "flex-1 aspect-square items-center justify-center rounded-full",
        selectedDay: "bg-text dark:bg-text-dark",
        todayDay: "",
        outsideMonthDay: "",
        disabledDay: "opacity-30",
        markedDot: "w-1 h-1 rounded-full mt-0.5",
        timePicker: "mt-4 pt-4 border-t border-border dark:border-border-dark"
    }

    const defaultTextStyles: CalendarTextStyles = {
        headerText: "text-xl font-bold text-center text-text dark:text-text-dark",
        weekDayText: "text-secondary-dark dark:text-secondary-dark-dark",
        weekNumberText: "text-secondary-light dark:text-secondary-light-dark",
        dayText: "text-center text-text dark:text-text-dark",
        selectedDayText: "text-background dark:text-background-dark",
        todayDayText: "text-tint dark:text-tint-dark",
        outsideMonthDayText: "text-secondary-light dark:text-secondary-light-dark",
        disabledDayText: "text-inactive dark:text-inactive-dark"
    }

    const mergedStyles = {
        ...defaultStyles,
        ...styles
    }

    const mergedTextStyles = {
        ...defaultTextStyles,
        ...textStyles
    }

    // Расчет недель и дат
    const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate])
    const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate])

    const weeks = useMemo(() => {
        const weeks = eachWeekOfInterval(
            { start: monthStart, end: monthEnd },
            { weekStartsOn }
        )

        return weeks.map(week => {
            const start = startOfWeek(week, { weekStartsOn })
            const end = endOfWeek(week, { weekStartsOn })
            return eachDayOfInterval({ start, end })
        })
    }, [monthStart, monthEnd, weekStartsOn])

    const weekDays = useMemo(() => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn })
        return eachDayOfInterval({
            start: weekStart,
            end: endOfWeek(weekStart, { weekStartsOn })
        }).map(day => formateDataTimeWithTimezoneAndLocale(day, 'EEEEEE'))
    }, [formateDataTimeWithTimezoneAndLocale, weekStartsOn])

    const isDateDisabled = (date: Date) => {
        if (minDate && date < minDate) return true
        if (maxDate && date > maxDate) return true
        return false
    }

    // Обработчики навигации и выбора даты
    const handlePrevMonth = () => {
        const newDate = subMonths(currentDate, 1)
        if (!minDate || newDate >= minDate) {
            setCurrentDate(newDate)
            onChange(newDate)
        }
    }

    const handleNextMonth = () => {
        const newDate = addMonths(currentDate, 1)
        if (!maxDate || newDate <= maxDate) {
            setCurrentDate(newDate)
            onChange(newDate)
        }
    }

    const handleDateSelect = (date: Date) => {
        if (!isDateDisabled(date)) {
            const newDate = new Date(date)
            newDate.setHours(
                currentDate.getHours(),
                currentDate.getMinutes(),
                currentDate.getSeconds(),
                currentDate.getMilliseconds()
            )
            setCurrentDate(newDate)
            onChange(newDate)
        }
    }

    return (
        <View
            variant="paper"
            className={cn(mergedStyles.container, className)}
            pointerEvents="auto"
        >
            {title && (
                <RNView className={mergedStyles.header}>
                    {showMonthNavigation && (
                        <Button
                            variant="ghost"
                            onPress={handlePrevMonth}
                            leftIcon="ChevronLeft"
                            className="px-2"
                        />
                    )}
                    <Text className={mergedTextStyles.headerText}>
                        {formateDataTimeWithTimezoneAndLocale(currentDate, 'LLLL yyyy')}
                    </Text>
                    {showMonthNavigation && (
                        <Button
                            variant="ghost"
                            onPress={handleNextMonth}
                            leftIcon="ChevronRight"
                            className="px-2"
                        />
                    )}
                </RNView>
            )}

            <RNView>
                <RNView className={mergedStyles.weekDays}>
                    {showWeekNumbers && (
                        <RNView className={mergedStyles.weekNumber}>
                            <Text className={mergedTextStyles.weekNumberText}>#</Text>
                        </RNView>
                    )}
                    {weekDays.map(day => (
                        <RNView key={day} className="flex-1 items-center justify-center">
                            <Text className={mergedTextStyles.weekDayText}>
                                {day}
                            </Text>
                        </RNView>
                    ))}
                </RNView>

                {weeks.map((week, weekIndex) => (
                    <RNView key={weekIndex} className="flex-row mb-2">
                        {showWeekNumbers && (
                            <RNView className={mergedStyles.weekNumber}>
                                <Text className={mergedTextStyles.weekNumberText}>
                                    {formateDataTimeWithTimezoneAndLocale(week[0], 'w')}
                                </Text>
                            </RNView>
                        )}
                        {week.map(day => {
                            const isSelected = isSameDay(day, currentDate)
                            const isDayToday = isToday(day)
                            const isCurrentMonth = isSameMonth(day, currentDate)
                            const disabled = isDateDisabled(day)
                            const dateKey = formateDataTimeWithTimezoneAndLocale(day, 'yyyy-MM-dd')
                            const marked = markedDates?.[dateKey]

                            return (
                                <Pressable
                                    key={day.toString()}
                                    onPress={() => !disabled && handleDateSelect(day)}
                                    className={cn(
                                        mergedStyles.day,
                                        !disableSelection && isSelected && mergedStyles.selectedDay,
                                        isDayToday && (!disableSelection ? !isSelected : true) && mergedStyles.todayDay,
                                        !isCurrentMonth && mergedStyles.outsideMonthDay,
                                        disabled && mergedStyles.disabledDay
                                    )}
                                >
                                    <Text
                                        className={cn(
                                            mergedTextStyles.dayText,
                                            !disableSelection && isSelected && mergedTextStyles.selectedDayText,
                                            isDayToday && (!disableSelection ? !isSelected : true) && mergedTextStyles.todayDayText,
                                            !isCurrentMonth && mergedTextStyles.outsideMonthDayText,
                                            disabled && mergedTextStyles.disabledDayText
                                        )}
                                    >
                                        {formateDataTimeWithTimezoneAndLocale(day, 'd')}
                                    </Text>
                                    {marked?.marked && (
                                        <RNView
                                            className={cn(
                                                mergedStyles.markedDot,
                                                "bg-tint dark:bg-tint-dark"
                                            )}
                                            style={marked.dotColor ? { backgroundColor: marked.dotColor } : undefined}
                                        />
                                    )}
                                </Pressable>
                            )
                        })}
                    </RNView>
                ))}
            </RNView>

            {showTimePicker && (
                <OpenTimePicker
                    initialDate={currentDate}
                    onChange={onChange}
                    format={timeFormat}
                    className={mergedStyles.timePicker}
                />
            )}
        </View>
    )
}