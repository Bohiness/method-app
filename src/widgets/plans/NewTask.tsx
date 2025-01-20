import { CalendarButton } from '@entities/plans/CalendarButton'
import { PriorityButton } from '@entities/plans/PriorityButton'
import { useModal } from '@shared/context/modal-provider'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { TaskPriority, TaskType } from '@shared/types/plans/TasksTypes'
import { Button } from '@shared/ui/button'
import { DatePickerModal } from '@shared/ui/datetime/DatePickerModal'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardEvent, Platform, Pressable, TextInput as RNTextInput, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


interface NewTaskProps {
    mode?: 'create' | 'edit'
    task?: TaskType
}

const NewTask = ({ mode = 'create', task }: NewTaskProps) => {
    const { t } = useTranslation()
    const { hideBottomSheet } = useModal()
    const insets = useSafeAreaInsets()
    const { createTask, updateTask, isOnline } = useOfflineTasks()

    // Инициализируем состояния в зависимости от режима
    const inputRef = useRef<RNTextInput>(null)
    const [title, setTitle] = useState(task?.text || '')
    const [subtasks, setSubtasks] = useState<Array<{ id: number; text: string }>>([])
    const [priority, setPriority] = useState<TaskPriority | null>(task?.priority || null)
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date>(
        task?.start_date ? new Date(task.start_date) : new Date()
    )


    const [keyboardHeight, setKeyboardHeight] = useState(0)

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event: KeyboardEvent) => {
                const height = Platform.OS === 'ios'
                    ? event.endCoordinates.height - insets.bottom + 8
                    : event.endCoordinates.height
                setKeyboardHeight(height)
            }
        )
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0)
            }
        )

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [insets.bottom])

    // Добавляем эффект для автофокуса
    useEffect(() => {
        if (mode === 'create') {
            // Небольшая задержка для корректной работы фокуса
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [mode])

    // Добавление подзадачи
    const handleAddSubtask = () => {
        setSubtasks([...subtasks, { id: Date.now(), text: '' }])
    }

    // Обновление текста подзадачи
    const handleUpdateSubtask = (id: number, text: string) => {
        setSubtasks(subtasks.map(task =>
            task.id === id ? { ...task, text } : task
        ))
    }

    // Удаление подзадачи
    const handleDeleteSubtask = (id: number) => {
        setSubtasks(subtasks.filter(task => task.id !== id))
    }

    // Отправка формы
    const handleSubmit = async () => {
        try {
            if (mode === 'edit' && task) {
                await updateTask.mutateAsync({
                    id: task.id,
                    data: {
                        text: title,
                        priority,
                        start_date: task.start_date,
                        end_date: task.end_date,
                    }
                })
            } else {
                await createTask.mutateAsync({
                    text: title,
                    priority,
                    start_date: new Date().toISOString(),
                    end_date: new Date().toISOString(),
                    status: 'pending'
                })
            }
            hideBottomSheet()
        } catch (error) {
            console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} task:`, error)
        }
    }

    const changePriority = (priority: TaskPriority) => {
        setPriority(priority)
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
    }

    return (
        <>
            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-4">
                    <Title>{t(mode === 'edit' ? 'common.edit' : 'common.create')}</Title>
                    {!isOnline && (
                        <View className="flex-row items-center">
                            <Icon name="WifiOff" size={16} className="mr-2 text-warning" />
                            <Text className="text-sm text-warning">
                                {t('common.offline')}
                            </Text>
                        </View>
                    )}
                </View>

                <ScrollView className="flex-1">
                    {/* Основное поле ввода */}
                    <TextInput
                        placeholder={t('tasks.new.inputPlaceholder')}
                        value={title}
                        variant='underline'
                        size='lg'
                        onChangeText={setTitle}
                        className="mb-4 px-2"
                        ref={inputRef}
                    />

                    {/* Подзадачи */}
                    {subtasks.map((subtask) => (
                        <View key={subtask.id} className="flex-row items-center ml-4 mb-2">
                            <TextInput
                                placeholder={t('tasks.new.subtaskPlaceholder')}
                                value={subtask.text}
                                variant='underline'
                                onChangeText={(text) => handleUpdateSubtask(subtask.id, text)}
                                className="flex-1 border-none bg-transparent"
                                rightIconFunction={() => handleDeleteSubtask(subtask.id)}
                                rightIcon={<Icon name="X" size={16} />}
                            />
                        </View>
                    ))}

                    {/* Кнопка добавления подзадачи */}
                    <Pressable
                        onPress={handleAddSubtask}
                        className="flex-row items-center ml-4 mt-2 gap-x-2"
                    >
                        <Icon name="Plus" size={20} />
                        <Text variant='secondary'>
                            {t('tasks.new.addSubtask')}
                        </Text>
                    </Pressable>
                </ScrollView>

                {/* Нижняя панель с иконками */}
                <View
                    className="flex-row justify-between items-center py-4 px-2 border-t border-border dark:border-border-dark"
                    style={{
                        position: 'absolute',
                        bottom: keyboardHeight,
                        left: 0,
                        right: 0,
                    }}
                >
                    <View className="flex-row justify-between gap-x-4">
                        <CalendarButton
                            date={selectedDate}
                            isActive={!!selectedDate}
                            onPress={() => setIsDatePickerVisible(true)}
                        />
                        <PriorityButton
                            priority={priority}
                            onPriorityChange={changePriority}
                        />

                    </View>

                    <Button
                        onPress={handleSubmit}
                        disabled={!title.trim() || createTask.isPending || updateTask.isPending}
                        leftIcon={mode === 'edit' ? 'Save' : 'Send'}
                        variant='outline'
                    />

                </View>

            </View>
            <DatePickerModal
                isVisible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                onSave={handleDateSelect}
                initialDate={selectedDate}
            />
        </>
    )
}

export default NewTask