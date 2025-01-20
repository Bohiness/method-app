// src/shared/ui/calendar/index.tsx
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
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths
} from 'date-fns'
import React, { useMemo } from 'react'
import { Pressable, View as RNView } from 'react-native'
import { Button } from './button'
import { Text } from './text'
import { TimePicker } from './time-picker'
import { View } from './view'

// Типы для кастомизации
interface CalendarCustomization {
    headerClassName?: string
    weekDaysClassName?: string
    dayClassName?: string
    selectedDayClassName?: string
    todayClassName?: string
    outsideMonthDayClassName?: string
    disabledDayClassName?: string
    weekNumberClassName?: string
    dotClassName?: string
    timePickerClassName?: string
}

interface CalendarColors {
    headerBackground?: string
    headerText?: string
    weekDaysText?: string
    dayText?: string
    selectedDayBackground?: string
    selectedDayText?: string
    todayText?: string
    outsideMonthDayText?: string
    disabledDayText?: string
    weekNumberText?: string
    defaultDotColor?: string
}

export interface CalendarProps {
    /** Выбранная дата */
    value: Date
    /** Колбэк изменения даты */
    onChange: (date: Date) => void
    /** Минимальная дата для выбора */
    minDate?: Date
    /** Максимальная дата для выбора */
    maxDate?: Date
    /** Отмеченные даты с дополнительной информацией */
    markedDates?: {
        [key: string]: {
            dotColor?: string
            marked?: boolean
        }
    }
    /** CSS классы для разных частей календаря */
    customization?: CalendarCustomization
    /** Цвета для разных элементов календаря */
    colors?: CalendarColors
    /** Показывать стрелки для навигации по месяцам */
    showMonthNavigation?: boolean
    /** Показывать выбор времени */
    showTimePicker?: boolean
    /** Формат выбора времени (12/24) */
    timeFormat?: '12h' | '24h'
    /** Шаг для выбора минут */
    minuteInterval?: number
    /** Показывать номера недель */
    showWeekNumbers?: boolean
    /** Начало недели (0-воскресенье, 1-понедельник) */
    weekStartsOn?: 0 | 1
    /** CSS классы */
    className?: string
    /** Заголовок */
    title?: string
}

export const Calendar: React.FC<CalendarProps> = ({
    value,
    onChange,
    minDate,
    maxDate,
    markedDates,
    customization = {},
    colors = {},
    showMonthNavigation = false,
    showTimePicker = false,
    timeFormat = '24h',
    minuteInterval = 1,
    showWeekNumbers = false,
    weekStartsOn = 1,
    className,
    title = true
}) => {
    const { isDark } = useTheme()
    const themeColors = useColors()
    const { formatDateTime, locale, timeZone } = useDateTime()

    // Объединяем цвета темы и пользовательские цвета
    const mergedColors = {
        headerBackground: colors.headerBackground || themeColors.background,
        headerText: colors.headerText || themeColors.text,
        weekDaysText: colors.weekDaysText || themeColors.secondary.dark,
        dayText: colors.dayText || themeColors.text,
        selectedDayBackground: colors.selectedDayBackground || themeColors.text,
        selectedDayText: colors.selectedDayText || themeColors.background,
        todayText: colors.todayText || themeColors.tint,
        outsideMonthDayText: colors.outsideMonthDayText || themeColors.secondary.light,
        disabledDayText: colors.disabledDayText || themeColors.inactive,
        weekNumberText: colors.weekNumberText || themeColors.secondary.light,
        defaultDotColor: colors.defaultDotColor || themeColors.tint,
    }

    // Начало и конец месяца с учетом таймзоны
    const monthStart = useMemo(() =>
        startOfMonth(value),
        [value, timeZone]
    )
    const monthEnd = useMemo(() =>
        endOfMonth(value),
        [value, timeZone]
    )

    // Получаем все недели месяца
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

    // Получаем названия дней недели с учетом локали
    const weekDays = useMemo(() => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn })
        return eachDayOfInterval({
            start: weekStart,
            end: endOfWeek(weekStart, { weekStartsOn })
        }).map(day => formatDateTime(day, 'EEEEEE'))
    }, [formatDateTime, weekStartsOn])

    const isDateDisabled = (date: Date) => {
        if (minDate && date < minDate) return true
        if (maxDate && date > maxDate) return true
        return false
    }

    // Навигация по месяцам
    const handlePrevMonth = () => {
        const newDate = subMonths(value, 1)
        if (!minDate || newDate >= minDate) {
            onChange(newDate)
        }
    }

    const handleNextMonth = () => {
        const newDate = addMonths(value, 1)
        if (!maxDate || newDate <= maxDate) {
            onChange(newDate)
        }
    }

    // Обработчик изменения времени
    const handleTimeChange = (hours: number, minutes: number) => {
        const newDate = new Date(value)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)
        onChange(newDate)
    }

    return (
        <View
            variant="paper"
            className={cn("rounded-2xl p-4", className)}
        >
            {/* Заголовок с месяцем и годом */}
            {title &&
                <RNView className={cn(
                    "flex-row items-center justify-between mb-4",
                    customization.headerClassName
                )}>
                    {showMonthNavigation && (
                        <Button
                            variant="ghost"
                            onPress={handlePrevMonth}
                            leftIcon="ChevronLeft"
                            className="px-2"
                        />
                    )}

                    <Text
                        className="text-xl font-bold text-center"
                        style={{ color: mergedColors.headerText }}
                    >
                        {formatDateTime(value, 'LLLL yyyy')}
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
            }

            {/* Сетка календаря */}
            <RNView>
                {/* Дни недели */}
                <RNView className="flex-row mb-2">
                    {showWeekNumbers && (
                        <RNView className="w-8 items-center justify-center">
                            <Text
                                className={cn("text-secondary-light", customization.weekNumberClassName)}
                                style={{ color: mergedColors.weekNumberText }}
                            >
                                #
                            </Text>
                        </RNView>
                    )}
                    {weekDays.map(day => (
                        <RNView
                            key={day}
                            className="flex-1 items-center justify-center"
                        >
                            <Text
                                className={cn("text-secondary-light", customization.weekDaysClassName)}
                                style={{ color: mergedColors.weekDaysText }}
                            >
                                {day}
                            </Text>
                        </RNView>
                    ))}
                </RNView>

                {/* Недели */}
                {weeks.map((week, weekIndex) => (
                    <RNView key={weekIndex} className="flex-row mb-2">
                        {showWeekNumbers && (
                            <RNView className="w-8 items-center justify-center">
                                <Text
                                    className={cn("text-secondary-light", customization.weekNumberClassName)}
                                    style={{ color: mergedColors.weekNumberText }}
                                >
                                    {formatDateTime(week[0], 'w')}
                                </Text>
                            </RNView>
                        )}
                        {week.map(day => {
                            const isSelected = isEqual(day, value)
                            const isDayToday = isToday(day)
                            const isCurrentMonth = isSameMonth(day, value)
                            const disabled = isDateDisabled(day)
                            const dateKey = formatDateTime(day, 'yyyy-MM-dd')
                            const marked = markedDates?.[dateKey]

                            return (
                                <Pressable
                                    key={day.toString()}
                                    onPress={() => !disabled && onChange(day)}
                                    className={cn(
                                        "flex-1 aspect-square items-center justify-center rounded-full",
                                        customization.dayClassName,
                                        isSelected && cn("bg-background dark:bg-background-dark", customization.selectedDayClassName),
                                        !isCurrentMonth && customization.outsideMonthDayClassName,
                                        disabled && customization.disabledDayClassName,
                                        isDayToday && customization.todayClassName
                                    )}
                                    style={{
                                        backgroundColor: isSelected ? mergedColors.selectedDayBackground : undefined
                                    }}
                                >
                                    <Text
                                        className={cn("text-center")}
                                        style={{
                                            color: disabled ? mergedColors.disabledDayText :
                                                isSelected ? mergedColors.selectedDayText :
                                                    !isCurrentMonth ? mergedColors.outsideMonthDayText :
                                                        isDayToday ? mergedColors.todayText :
                                                            mergedColors.dayText
                                        }}
                                    >
                                        {formatDateTime(day, 'd')}
                                    </Text>
                                    {marked?.marked && (
                                        <RNView
                                            className={cn("w-1 h-1 rounded-full mt-0.5", customization.dotClassName)}
                                            style={{ backgroundColor: marked.dotColor || mergedColors.defaultDotColor }}
                                        />
                                    )}
                                </Pressable>
                            )
                        })}
                    </RNView>
                ))}
            </RNView>

            {/* Выбор времени */}
            {showTimePicker && (
                <View
                    className={cn("mt-4 pt-4 border-t border-border", customization.timePickerClassName)}
                >
                    <TimePicker
                        value={value}
                        onChange={handleTimeChange}
                        format="24h"
                        minuteInterval={5}
                    />
                </View>
            )}
        </View>
    )
}