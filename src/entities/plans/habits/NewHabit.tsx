import { useHabits } from '@shared/hooks/plans/useHabits'
import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { Button } from '@shared/ui/button'
import { ColorPicker } from '@shared/ui/color-picker'
import { IconPicker } from '@shared/ui/icon-picker'
import { Title } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { CycleSelectionButton } from '../CycleSelectionButton'

interface NewHabitModalProps {
    isVisible: boolean
    onClose: () => void
    onSuccess: (habit: any) => void
}

export function NewHabit({ isVisible, onClose, onSuccess }: NewHabitModalProps) {
    const { createHabit } = useHabits()
    const { t } = useTranslation()
    const { keyboardHeight, isKeyboardVisible, dismissKeyboard } = useKeyboard()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState('#000000')
    const [icon, setIcon] = useState('')
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const [useCustomFrequency, setUseCustomFrequency] = useState(false)
    const [dailyTarget, setDailyTarget] = useState(1)
    const [customIntervalDays, setCustomIntervalDays] = useState<number | ''>('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([])
    const [selectedMonthDays, setSelectedMonthDays] = useState<(number | 'last')[]>([])

    if (!isVisible) return null

    const handleSubmit = async () => {
        if (!title.trim()) return

        setIsLoading(true)
        try {
            const newHabit = await createHabit.mutateAsync({
                title: title.trim(),
                color,
                icon,
                frequency: useCustomFrequency ? 'custom' : frequency,
                daily_target: dailyTarget,
                custom_interval_days: useCustomFrequency ? Number(customIntervalDays) : undefined,
            })
            onSuccess(newHabit)
        } catch (error) {
            console.error('Ошибка при создании привычки:', error)
        } finally {
            setIsLoading(false)
            onClose()
        }
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setColor('#000000')
        setIcon('')
        setFrequency('daily')
        setUseCustomFrequency(false)
        setDailyTarget(1)
        setCustomIntervalDays('')
        setSelectedWeekDays([])
        setSelectedMonthDays([])
    }

    useEffect(() => {
        if (!isVisible) {
            resetForm()
        }
    }, [isVisible])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
        >
            <Pressable className="flex-1" onPress={dismissKeyboard}>
                <View className="flex-1 gap-y-4 justify-between p-4">
                    <Title>{t('plans.habits.newHabit.title')}</Title>
                    <View className="flex-1 gap-y-4">
                        <TextInput
                            placeholder={t('plans.habits.newHabit.titlePlaceholder')}
                            value={title}
                            variant='underline'
                            size='lg'
                            onChangeText={setTitle}
                            voiceInput
                            voiceInputSize='sm'
                            voiceInputVerticalAlign='center'
                        />
                        <TextInput
                            value={description}
                            variant='ghost'
                            size='sm'
                            onChangeText={setDescription}
                            placeholder={t('plans.habits.newHabit.descriptionPlaceholder')}
                            voiceInput
                            voiceInputSize='sm'
                            voiceInputVerticalAlign='center'
                            voiceInputOnActiveOnly
                        />
                        <ColorPicker
                            selectedColor={color}
                            onSelectColor={setColor}
                            label={t('plans.habits.newHabit.colorLabel')}
                        />

                        <IconPicker
                            value={icon}
                            onChange={setIcon}
                        />

                        <CycleSelectionButton
                            initialCycle={frequency}
                            initialWeekDays={selectedWeekDays}
                            initialMonthDays={selectedMonthDays}
                            onSelect={(cycle, selectedDays) => {
                                setFrequency(cycle)
                                if (cycle === 'weekly' && selectedDays) {
                                    setSelectedWeekDays(selectedDays as number[])
                                } else if (cycle === 'monthly' && selectedDays) {
                                    setSelectedMonthDays(selectedDays as (number | 'last')[])
                                }
                            }}
                        />

                        <View className="flex-row items-center gap-x-2 mt-2">
                            <Button
                                onPress={() => setUseCustomFrequency(!useCustomFrequency)}
                                variant={useCustomFrequency ? 'default' : 'outline'}
                                size="sm"
                            >
                                {t('plans.habits.newHabit.customFrequency', 'Пользовательская частота')}
                            </Button>

                            {useCustomFrequency && (
                                <TextInput
                                    placeholder={t('plans.habits.newHabit.daysInterval', 'Интервал в днях')}
                                    value={customIntervalDays.toString()}
                                    onChangeText={(text) => {
                                        const value = text.replace(/[^0-9]/g, '')
                                        setCustomIntervalDays(value === '' ? '' : Number(value))
                                    }}
                                    keyboardType="numeric"
                                    className="flex-1"
                                    size="sm"
                                />
                            )}
                        </View>
                    </View>
                    <View
                        className="flex-row justify-between items-center py-4 px-2 border-t border-border dark:border-border-dark"
                        style={{
                            position: 'absolute',
                            bottom: isKeyboardVisible ? keyboardHeight : 16,
                            left: 16,
                            right: 16,
                        }}
                    >

                        <Button
                            onPress={handleSubmit}
                            disabled={createHabit.isPending}
                            leftIcon='Send'
                            variant='outline'
                            className='ml-auto'
                        />

                    </View>
                </View>
            </Pressable>

        </KeyboardAvoidingView>
    )
}