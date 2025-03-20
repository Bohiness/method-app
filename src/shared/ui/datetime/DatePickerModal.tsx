// src/features/tasks/components/DatePickerModal.tsx
import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from 'date-fns'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, TouchableOpacity } from 'react-native'

import { logger } from '@shared/lib/logger/logger.service'
import { Button } from '../button'
import { Calendar } from '../calendar'
import { View } from '../view'

interface DatePickerModalProps {
    isVisible: boolean
    onClose: () => void
    onSave: (date: Date) => void
    initialDate?: Date
    showTimePicker?: boolean
    backdrop?: boolean
    backdropVariant?: 'default' | 'paper' | 'canvas' | 'stone' | 'inverse' | 'transparent'
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
    isVisible,
    onClose,
    onSave,
    initialDate = new Date(),
    backdrop = false,
    backdropVariant = 'default',
    showTimePicker = false
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
        <View pointerEvents="auto" className="rounded-2xl w-[85%] p-4 gap-y-4" variant="default">
            {selectedDate && (
                <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    showMonthNavigation
                    showTimePicker={showTimePicker}
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

    logger.log(selectedDate, 'DatePickerModal')

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {backdrop ? (
                <View className="flex-1" variant={backdropVariant}>
                    {/* Фоновая область, которая закрывает модальное окно при нажатии */}
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={onClose}
                        className="absolute inset-0"
                    />

                    {/* Контент модального окна, который не закрывается при нажатии */}
                    <View pointerEvents="box-none" className="flex-1 justify-center items-center">
                        {Content}
                    </View>
                </View>
            ) : (
                <View pointerEvents="box-none" className="flex-1 justify-center items-center">
                    {Content}
                </View>
            )}
        </Modal>
    )
}