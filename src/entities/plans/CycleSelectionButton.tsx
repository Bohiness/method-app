import { Badge } from '@shared/ui/badge'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { CycleSelection } from './CycleSelection'

export interface CycleSelectionButtonProps {
    initialCycle?: 'daily' | 'weekly' | 'monthly'
    initialWeekDays?: number[]
    initialMonthDays?: (number | 'last')[]
    /**
     * onSelect возвращает выбранный тип цикла и выбранные дни:
     * - 'daily': без дополнительных данных
     * - 'weekly': массив индексов дней недели (от 0 до 6)
     * - 'monthly': массив чисел (от 1 до 30) и/или 'last' для последнего дня
     */
    onSelect?: (
        cycle: 'daily' | 'weekly' | 'monthly',
        selectedDays?: number[] | (number | 'last')[]
    ) => void
}

export const CycleSelectionButton = ({
    initialCycle = 'daily',
    initialWeekDays = [],
    initialMonthDays = [],
    onSelect
}: CycleSelectionButtonProps) => {
    const { t } = useTranslation()
    const [modalVisible, setModalVisible] = useState(false)
    const [cycle, setCycle] = useState<'daily' | 'weekly' | 'monthly'>(initialCycle)
    const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>(initialWeekDays)
    const [selectedMonthDays, setSelectedMonthDays] = useState<(number | 'last')[]>(initialMonthDays)

    const weekDaysAbbr = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

    const getButtonLabel = (): string => {
        switch (cycle) {
            case 'daily':
                return t('cycle.daily', 'Каждый день')
            case 'weekly':
                if (selectedWeekDays.length > 0) {
                    const selectedLabels = selectedWeekDays
                        .sort((a, b) => a - b)
                        .map(idx => weekDaysAbbr[idx])
                        .join(', ')
                    return `${t('cycle.weekly', 'Каждую неделю')} (${selectedLabels})`
                }
                return t('cycle.weekly', 'Каждую неделю')
            case 'monthly':
                if (selectedMonthDays.length > 0) {
                    const selectedLabels = selectedMonthDays
                        .map(item => (item === 'last' ? t('cycle.last', 'Последний') : item.toString()))
                        .join(', ')
                    return `${t('cycle.monthly', 'Каждый месяц')} (${selectedLabels})`
                }
                return t('cycle.monthly', 'Каждый месяц')
            default:
                return ''
        }
    }

    const handleCycleSelect = (
        selectedCycle: 'daily' | 'weekly' | 'monthly',
        selectedDays?: number[] | (number | 'last')[]
    ) => {
        setCycle(selectedCycle)
        if (selectedCycle === 'weekly' && Array.isArray(selectedDays)) {
            setSelectedWeekDays(selectedDays as number[])
        }
        if (selectedCycle === 'monthly' && Array.isArray(selectedDays)) {
            setSelectedMonthDays(selectedDays as (number | 'last')[])
        }
        if (onSelect) {
            onSelect(selectedCycle, selectedDays)
        }
    }

    return (
        <View>
            <Pressable onPress={() => setModalVisible(true)}>
                <Badge size="lg">
                    {getButtonLabel()}
                </Badge>
            </Pressable>
            <CycleSelection
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={(cycle, selectedDays) => {
                    handleCycleSelect(cycle, selectedDays)
                    setModalVisible(false)
                }}
                initialCycle={cycle}
                initialWeekDays={selectedWeekDays}
                initialMonthDays={selectedMonthDays}
            />
        </View>
    )
}