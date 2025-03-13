import DateTimePicker from '@react-native-community/datetimepicker'
import { useColors, useTheme } from '@shared/context/theme-provider'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { cn } from '@shared/lib/utils/cn'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { View } from '@shared/ui/view'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, Pressable, StyleSheet } from 'react-native'

export interface TimePickerProps {
    time?: Date
    onChange: (time: Date) => void
    className?: string
    variant?: 'default' | 'outline' | 'ghost'
}

export const TimePicker = ({
    time,
    onChange,
    className,
    variant = 'default'
}: TimePickerProps) => {
    const { t } = useTranslation()
    const { formatDateTime } = useDateTime()
    const { colors, isDark } = useTheme()
    const themeColors = useColors()
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

    // Получаем классы для варианта
    const getVariantClasses = () => {
        const variants = {
            default: 'bg-surface-paper dark:bg-surface-paper-dark',
            outline: 'border border-border dark:border-border-dark bg-transparent',
            ghost: 'bg-transparent'
        }
        return variants[variant]
    }

    return (
        <View className={cn('flex-row items-center justify-between', className)}>
            {/* Кнопка для открытия модального окна выбора времени */}
            <HapticTab onPress={() => setModalVisible(true)}>
                <Badge size="lg" variant={variant === 'ghost' ? 'outline' : 'default'}>
                    {formatDateTime(time || tempTime, 'HH:mm')}
                </Badge>
            </HapticTab>

            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent
                onRequestClose={handleCancel}
            >
                <Pressable
                    style={[
                        styles.modalOverlay,
                        { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }
                    ]}
                    onPress={handleCancel}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: themeColors.surface.paper,
                                borderColor: themeColors.border,
                            }
                        ]}
                        className={cn(
                            'rounded-2xl border px-6 py-4 text-center',
                            getVariantClasses()
                        )}
                    >
                        {/* Компонент выбора времени */}
                        <DateTimePicker
                            value={tempTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onTimeChange}
                            textColor={themeColors.text}
                            themeVariant={isDark ? 'dark' : 'light'}
                            style={{
                                marginHorizontal: 'auto'
                            }}
                        />
                        <View
                            className="flex-row justify-around mt-5 px-4"
                            variant="transparent"
                        >
                            <Button
                                variant="ghost"
                                onPress={handleCancel}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant="default"
                                onPress={handleConfirm}
                            >
                                {t('common.confirm')}
                            </Button>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '100%',
    }
})