import DateTimePicker from '@react-native-community/datetimepicker'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, Pressable, View } from 'react-native'

export interface TimePickerProps {
    time?: Date
    onChange: (time: Date) => void
}

export const TimePicker = ({ time, onChange }: TimePickerProps) => {
    const { t } = useTranslation()
    const { formatDateTime } = useDateTime()
    // Показ модального окна для выбора времени
    const [modalVisible, setModalVisible] = useState(false)
    // Временная переменная для выбранного времени до подтверждения
    const [tempTime, setTempTime] = useState<Date>(time || new Date())

    const handleConfirm = () => {
        onChange(tempTime)
        setModalVisible(false)
    }

    const handleCancel = () => {
        // При отмене возвращаем предыдущий выбор
        setTempTime(time || new Date())
        setModalVisible(false)
    }

    const onTimeChange = (event: any, selectedTime?: Date) => {
        // Если пользователь выбрал новое время, обновляем временное состояние
        if (selectedTime) {
            setTempTime(selectedTime)
        }
    }

    return (
        <View>
            {/* Кнопка для открытия модального окна выбора времени */}
            <HapticTab onPress={() => setModalVisible(true)}>
                <Badge size="lg">
                    {formatDateTime(time || tempTime, 'HH:mm')}
                </Badge>
            </HapticTab>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={handleCancel}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={handleCancel}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            width: '80%'
                        }}
                    >
                        {/* Компонент выбора времени */}
                        <DateTimePicker
                            value={tempTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onTimeChange}
                            style={{ width: '100%' }}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                            <Button onPress={handleCancel}>
                                {t('common.cancel')}
                            </Button>
                            <Button onPress={handleConfirm}>
                                {t('common.confirm')}
                            </Button>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}