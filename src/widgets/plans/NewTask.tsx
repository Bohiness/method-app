import { CalendarButton } from '@entities/plans/CalendarButton'
import { PriorityButton } from '@entities/plans/PriorityButton'
import { ProjectChoice } from '@entities/plans/projects/ProjectChoise'
import { useTheme } from '@shared/context/theme-provider'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { CreateTaskDtoType, SubTaskType, TaskPriority, TaskType } from '@shared/types/plans/TasksTypes'
import { Button } from '@shared/ui/button'
import { DatePickerModal } from '@shared/ui/datetime/DatePickerModal'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Pressable, TextInput as RNTextInput, ScrollView } from 'react-native'


interface NewTaskProps {
    mode?: 'create' | 'edit'
    task?: TaskType
    initialProjectId?: number | null
}

const NewTask = ({ mode = 'create', task, initialProjectId }: NewTaskProps) => {
    const { t } = useTranslation()
    const { createTask, updateTask, isOnline, deleteTask } = useOfflineTasks()
    const { colors } = useTheme()
    const { convertToTimeZoneAndLocale } = useDateTime()

    // Инициализируем состояния в зависимости от режима
    const inputRef = useRef<RNTextInput>(null)
    const [title, setTitle] = useState(task?.text || '')
    // Изменяем инициализацию состояния subtasks
    const [subtasks, setSubtasks] = useState<Array<SubTaskType>>(
        task?.subtasks || []
    )
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'none')
    const [selectedDate, setSelectedDate] = useState<Date>(
        task?.start_datetime ? convertToTimeZoneAndLocale(task.start_datetime) : new Date(new Date().setHours(9, 0, 0, 0)),
    )
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || task?.project || null)
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)

    const { keyboardHeight, isKeyboardVisible } = useKeyboard()


    // Добавляем эффект для автофокуса
    useEffect(() => {
        if (mode === 'create') {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [mode])

    useEffect(() => {
        if (mode === 'edit' && task) {
            setTitle(task.text || '')
            setSubtasks(task.subtasks || [])
            setPriority(task.priority || 'none')
            setSelectedDate(task.start_datetime ? new Date(task.start_datetime) : new Date(new Date().setHours(9, 0, 0, 0)))
            setSelectedProjectId(task.project || null)
        }
    }, [task, mode])

    // Добавление подзадачи
    const handleAddSubtask = () => {
        const newSubtask: SubTaskType = {
            id: Date.now(),
            text: '',
            task: task?.id || 0,
            status: 'pending',
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        setSubtasks([...subtasks, newSubtask])
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

    const handleDeleteTask = async () => {
        if (mode === 'edit' && task) {
            try {
                await deleteTask.mutateAsync(task.id)
            } catch (error) {
                console.error('Error deleting task:', error)
            }
        }
    }


    const handleSubmit = async () => {
        try {
            const taskData: CreateTaskDtoType = {
                text: title,
                priority: priority,
                start_datetime: selectedDate.toISOString(),
                end_datetime: selectedDate.toISOString(),
                is_completed: false,
                project: selectedProjectId || undefined,
                subtasks: subtasks,
                status: 'pending' as const
            }

            if (mode === 'edit' && task) {
                await updateTask.mutateAsync({
                    id: task.id,
                    data: taskData
                })
            } else {
                await createTask.mutateAsync(taskData)
            }
        } catch (error) {
            console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} task:`, error)
        } finally {
            router.dismissTo('/(tabs)/plans')
        }
    }

    const changePriority = (newPriority: TaskPriority) => {
        setPriority(newPriority)
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setIsDatePickerVisible(false)
    }

    const handleDateButtonPress = () => {
        Keyboard.dismiss()
        setIsDatePickerVisible(true)
    }

    return (
        <>
            <View variant='default' className="flex-1 px-4 relative">
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
                    {mode === 'edit' && (
                        <Button
                            onPress={handleDeleteTask}
                            leftIcon="Trash"
                            variant="ghost"
                            size="sm"
                            iconSize={20}
                            iconProps={{
                                color: colors.secondary.light,
                            }}
                        />
                    )}

                </View>

                <ScrollView className="flex-1">
                    {/* Основное поле ввода */}
                    <TextInput
                        placeholder={t('plans.tasks.new.inputPlaceholder')}
                        value={title}
                        variant='underline'
                        size='lg'
                        onChangeText={setTitle}
                        className="mb-4 px-2"
                        ref={inputRef}
                        voiceInput
                        voiceInputSize='sm'
                        voiceInputVerticalAlign='center'
                    />

                    {/* Подзадачи */}
                    {subtasks.map((subtask) => (
                        <View key={subtask.id} className="flex-row items-center ml-4 mb-2">
                            <TextInput
                                placeholder={t('plans.tasks.new.subtaskPlaceholder')}
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
                            {t('plans.tasks.new.addSubtask')}
                        </Text>
                    </Pressable>
                </ScrollView>


                <View
                    className='absolute'
                    style={{
                        bottom: isKeyboardVisible ? keyboardHeight + 84 : 100,
                        left: 16,
                    }}
                >
                    <ProjectChoice
                        selectedProjectId={selectedProjectId}
                        onChangeSelectedProject={setSelectedProjectId}
                    />
                </View>

                {/* Нижняя панель с иконками */}
                <View
                    className="flex-row justify-between items-center py-4 px-2 border-t border-border dark:border-border-dark"
                    style={{
                        position: 'absolute',
                        bottom: isKeyboardVisible ? keyboardHeight : 16,
                        left: 16,
                        right: 16,
                    }}
                >
                    <View className="flex-row justify-between items-center gap-x-4">
                        <CalendarButton
                            date={selectedDate}
                            isActive={true}
                            onPress={handleDateButtonPress}
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
                backdrop
                showTimePicker
            />
        </>
    )
}

export default NewTask