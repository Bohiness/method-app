// src/features/tasks/components/DatePickerModal.tsx
import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from 'date-fns'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, TouchableWithoutFeedback, View } from 'react-native'

import { Button } from '../button'
import { Calendar } from '../calendar'

interface DatePickerModalProps {
    isVisible: boolean
    onClose: () => void
    onSave: (date: Date) => void
    initialDate?: Date
    backdrop?: boolean
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
    isVisible,
    onClose,
    onSave,
    initialDate = new Date(),
    backdrop = false
}) => {
    const { t } = useTranslation()
    const [selectedDate, setSelectedDate] = useState<Date>(() => initialDate)
    const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(initialDate))

    // Получаем дни текущего месяца
    const days = useMemo(() => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        return eachDayOfInterval({ start, end })
    }, [currentMonth])

    // Получаем пустые дни для правильного выравнивания
    const emptyDays = useMemo(() => {
        const start = startOfMonth(currentMonth)
        let day = getDay(start)
        day = day === 0 ? 6 : day - 1
        return Array(day).fill(null)
    }, [currentMonth])

    // Создаем содержимое модального окна
    const Content = (
        // Внутреннему контейнеру явно задаём pointerEvents="auto"
        <View pointerEvents="auto" className="bg-background dark:bg-background-dark rounded-2xl w-[85%] p-4 gap-y-4">
            {selectedDate && (
                <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    showMonthNavigation
                    showTimePicker
                />
            )}

            {/* Нижние кнопки */}
            <View className="flex-row justify-between">
                <Button onPress={onClose} variant="ghost">
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
    )

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {backdrop ? (
                // Внешний TouchableWithoutFeedback оборачивает фон.
                // Устанавливаем pointerEvents="box-none" на View, чтобы дочерние компоненты получали события.
                <TouchableWithoutFeedback onPress={onClose}>
                    <View pointerEvents="box-none" className="flex-1 justify-center items-center bg-background dark:bg-background-dark">
                        {Content}
                    </View>
                </TouchableWithoutFeedback>
            ) : (
                <View pointerEvents="box-none" className="flex-1 justify-center items-center">
                    {Content}
                </View>
            )}
        </Modal>
    )
}