// src/features/tasks/components/DatePickerModal.tsx
import { View } from '@shared/ui/view'
import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from 'date-fns'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from 'react-native'
import { Button } from '../button'
import { Calendar } from '../calendar'

interface DatePickerModalProps {
    isVisible: boolean
    onClose: () => void
    onSave: (date: Date) => void
    initialDate?: Date
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
    isVisible,
    onClose,
    onSave,
    initialDate = new Date()
}) => {
    const { t } = useTranslation()
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
    const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(initialDate))

    // Получаем дни для текущего месяца
    const getDaysInMonth = () => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        return eachDayOfInterval({ start, end })
    }

    // Получаем пустые дни в начале месяца для правильного выравнивания
    const getEmptyDays = () => {
        const start = startOfMonth(currentMonth)
        let day = getDay(start)
        day = day === 0 ? 6 : day - 1 // Корректировка для недели, начинающейся с понедельника
        return Array(day).fill(null)
    }

    const days = getDaysInMonth()
    const emptyDays = getEmptyDays()

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-background dark:bg-background-dark rounded-2xl w-[85%] p-4">

                    <Calendar
                        value={selectedDate}
                        onChange={setSelectedDate}
                        showMonthNavigation
                    />

                    {/* Нижние кнопки */}
                    <View className="flex-row justify-between pt-4">
                        <Button
                            onPress={onClose}
                            variant="ghost"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="outline"
                            onPress={() => {
                                onSave(selectedDate)
                                onClose()
                            }}
                        >
                            {t('common.save')}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    )
}