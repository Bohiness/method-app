import { cn } from '@shared/lib/utils/cn'
import { Button } from '@shared/ui/button'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Modal,
    Pressable,
    Text,
    View
} from 'react-native'

export interface CycleSelectionProps {
    isVisible: boolean
    onClose: () => void
    /**
     * onSelect возвращает выбранный тип цикла и дополнительные выбранные дни (если применимо):
     * - "daily": выбран без дополнительных данных
     * - "weekly": массив индексов (0 - Пн, 1 - Вт, …, 6 - Вс)
     * - "monthly": массив значений (числа от 1 до 30, а также 'last' для последнего дня)
     */
    onSelect: (
        cycle: 'daily' | 'weekly' | 'monthly',
        selectedDays?: number[] | (number | 'last')[]
    ) => void
    // Опциональные начальные значения
    initialCycle?: 'daily' | 'weekly' | 'monthly'
    initialWeekDays?: number[]
    initialMonthDays?: (number | 'last')[]
}

const defaultClasses = {
    modalOverlay: "flex-1 bg-background dark:bg-background-dark justify-center items-center",
    modalContent: "bg-white dark:bg-background-dark rounded-2xl p-4 w-[90%] max-h-[90%]",
    modalTitle: "text-xl font-bold mb-5 text-center",
    cycleOptionsContainer: "flex-row justify-around mb-5",
    cycleButton: "p-2.5 rounded",
    activeCycleButton: "border border-border dark:border-border-dark",
    inactiveCycleButton: "text-secondary-light dark:text-secondary-light-dark",
    activeCycleButtonText: "text-text dark:text-text-dark",
    inactiveCycleButtonText: "text-secondary-light dark:text-secondary-light-dark",
    sectionContainer: "my-5",
    sectionTitle: "mb-2 text-center",
    weekDaysContainer: "flex-row justify-around",
    weekDayButton: "w-10 h-10 rounded-full justify-center items-center",
    monthlyScrollView: "max-h-[200px]",
    monthDaysContainer: "flex-row flex-wrap justify-center",
    monthDayButton: "w-10 h-10 rounded-full justify-center items-center m-1",
    activeDayButton: "border border-text dark:border-text-dark",
    inactiveDayButton: "border border-border dark:border-border-dark",
    activeDayButtonText: "text-text dark:text-text-dark bottom-0",
    inactiveDayButtonText: "text-secondary-light dark:text-secondary-light-dark",
    buttonsContainer: "flex-row justify-around"
}

export const CycleSelection = ({
    isVisible,
    onClose,
    onSelect,
    initialCycle = 'daily',
    initialWeekDays = [],
    initialMonthDays = []
}: CycleSelectionProps) => {
    const { t } = useTranslation()
    const [cycle, setCycle] = useState<'daily' | 'weekly' | 'monthly'>(initialCycle)
    const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>(initialWeekDays)
    const [selectedMonthDays, setSelectedMonthDays] = useState<(number | 'last')[]>(initialMonthDays)

    useEffect(() => {
        // При закрытии модального окна можно сбрасывать выбор либо оставлять
        if (!isVisible) {
            setCycle(initialCycle)
            setSelectedWeekDays(initialWeekDays)
            setSelectedMonthDays(initialMonthDays)
        }
    }, [isVisible, initialCycle, initialWeekDays, initialMonthDays])

    const toggleWeekDay = (dayIndex: number) => {
        if (selectedWeekDays.includes(dayIndex)) {
            setSelectedWeekDays(selectedWeekDays.filter(day => day !== dayIndex))
        } else {
            setSelectedWeekDays([...selectedWeekDays, dayIndex])
        }
    }

    const toggleMonthDay = (day: number | 'last') => {
        if (selectedMonthDays.includes(day)) {
            setSelectedMonthDays(selectedMonthDays.filter(item => item !== day))
        } else {
            setSelectedMonthDays([...selectedMonthDays, day])
        }
    }

    const handleConfirm = () => {
        if (cycle === 'daily') {
            onSelect(cycle)
        } else if (cycle === 'weekly') {
            onSelect(cycle, selectedWeekDays)
        } else if (cycle === 'monthly') {
            onSelect(cycle, selectedMonthDays)
        }
        onClose()
    }

    // Массив для дней недели с использованием переводов
    const weekDays = [
        t('components.CycleSelection.weekDays.mon'),
        t('components.CycleSelection.weekDays.tue'),
        t('components.CycleSelection.weekDays.wed'),
        t('components.CycleSelection.weekDays.thu'),
        t('components.CycleSelection.weekDays.fri'),
        t('components.CycleSelection.weekDays.sat'),
        t('components.CycleSelection.weekDays.sun')
    ]

    // Массив для дней месяца: числа от 1 до 30 и опция "last" для последнего дня
    const monthDays = Array.from({ length: 30 }, (_, i) => i + 1).concat('last')

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable className={defaultClasses.modalOverlay} onPress={onClose}>
                <Pressable onPress={(e) => e.stopPropagation()} className={defaultClasses.modalContent}>
                    <Text className={defaultClasses.modalTitle}>
                        {t('components.CycleSelection.chooseCycle')}
                    </Text>
                    <View className={defaultClasses.cycleOptionsContainer}>
                        <Pressable
                            onPress={() => setCycle('daily')}
                            className={cn(
                                defaultClasses.cycleButton,
                                cycle === 'daily'
                                    ? defaultClasses.activeCycleButton
                                    : defaultClasses.inactiveCycleButton
                            )}
                        >
                            <Text className={cycle === 'daily' ? defaultClasses.activeCycleButtonText : defaultClasses.inactiveCycleButtonText}>
                                {t('components.CycleSelection.daily')}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setCycle('weekly')}
                            className={cn(
                                defaultClasses.cycleButton,
                                cycle === 'weekly'
                                    ? defaultClasses.activeCycleButton
                                    : defaultClasses.inactiveCycleButton
                            )}
                        >
                            <Text className={cycle === 'weekly' ? defaultClasses.activeCycleButtonText : defaultClasses.inactiveCycleButtonText}>
                                {t('components.CycleSelection.weekly')}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setCycle('monthly')}
                            className={cn(
                                defaultClasses.cycleButton,
                                cycle === 'monthly'
                                    ? defaultClasses.activeCycleButton
                                    : defaultClasses.inactiveCycleButton
                            )}
                        >
                            <Text className={cycle === 'monthly' ? defaultClasses.activeCycleButtonText : defaultClasses.inactiveCycleButtonText}>
                                {t('components.CycleSelection.monthly')}
                            </Text>
                        </Pressable>
                    </View>

                    {cycle === 'weekly' && (
                        <View className={defaultClasses.sectionContainer}>
                            <Text className={defaultClasses.sectionTitle}>
                                {t('components.CycleSelection.chooseWeekDays')}
                            </Text>
                            <View className={defaultClasses.weekDaysContainer}>
                                {weekDays.map((day, index) => {
                                    const isSelected = selectedWeekDays.includes(index)
                                    return (
                                        <Pressable
                                            key={index}
                                            onPress={() => toggleWeekDay(index)}
                                            className={cn(
                                                defaultClasses.weekDayButton,
                                                isSelected ? defaultClasses.activeDayButton : defaultClasses.inactiveDayButton
                                            )}
                                        >
                                            <Text className={isSelected ? defaultClasses.activeDayButtonText : defaultClasses.inactiveDayButtonText}>
                                                {day}
                                            </Text>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </View>
                    )}

                    {cycle === 'monthly' && (
                        <View className={defaultClasses.sectionContainer}>
                            <Text className={defaultClasses.sectionTitle}>
                                {t('components.CycleSelection.chooseMonthDays')}
                            </Text>
                            <View className={defaultClasses.monthlyScrollView}>
                                <View className={defaultClasses.monthDaysContainer}>
                                    {monthDays.map((day, index) => {
                                        const isSelected = selectedMonthDays.includes(day)
                                        const displayText =
                                            day === 'last'
                                                ? t('components.CycleSelection.monthDay.last')
                                                : day.toString()
                                        return (
                                            <Pressable
                                                key={index}
                                                onPress={() => toggleMonthDay(day)}
                                                className={cn(
                                                    defaultClasses.monthDayButton,
                                                    isSelected ? defaultClasses.activeDayButton : defaultClasses.inactiveDayButton
                                                )}
                                            >
                                                <Text className={cn(
                                                    isSelected ? defaultClasses.activeDayButtonText : defaultClasses.inactiveDayButtonText,
                                                    "text-xs"
                                                )}>
                                                    {displayText}
                                                </Text>
                                            </Pressable>
                                        )
                                    })}
                                </View>
                            </View>
                        </View>
                    )}

                    <View className={defaultClasses.buttonsContainer}>
                        <Button onPress={onClose} variant="ghost">
                            {t('components.CycleSelection.cancel')}
                        </Button>
                        <Button onPress={handleConfirm} variant="outline">
                            {t('components.CycleSelection.confirm')}
                        </Button>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}