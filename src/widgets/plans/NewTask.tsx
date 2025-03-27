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
import { Text } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput as RNTextInput, ScrollView } from 'react-native'
import Animated, { Layout } from 'react-native-reanimated'

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
    const { hideKeyboard } = useKeyboard()

    // Инициализируем состояния в зависимости от режима
    const inputRef = useRef<RNTextInput>(null)
    const [title, setTitle] = useState(task?.text || '')
    // Изменяем инициализацию состояния subtasks
    const [subtasks, setSubtasks] = useState<Array<SubTaskType>>(
        task?.subtasks || []
    )
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'none')
    const [selectedDate, setSelectedDate] = useState<Date>(
        task?.start_datetime ? convertToTimeZoneAndLocale(task.start_datetime) : new Date()
    )
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || task?.project || null)
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)

    // Добавляем эффект для автофокуса
    useEffect(() => {
        if (mode === 'create') {
            inputRef.current?.focus()
        }
    }, [mode])

    useEffect(() => {
        if (mode === 'edit' && task) {
            setTitle(task.text || '')
            setSubtasks(task.subtasks || [])
            setPriority(task.priority || 'none')

            // Если есть start_datetime, используем его, иначе создаем новую дату с 9:00
            if (task.start_datetime) {
                setSelectedDate(new Date(task.start_datetime))
            } else {
                const localDate = new Date()
                localDate.setHours(9, 0, 0, 0)
                setSelectedDate(localDate)
            }

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
                status: 'pending' as const,
                is_time_enabled: false
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

    const handleDateSelect = async (date: Date) => {
        setSelectedDate(convertToTimeZoneAndLocale(date))
        setIsDatePickerVisible(false)
    }

    const handleDateButtonPress = async () => {
        setTimeout(async () => {
            await hideKeyboard()
        }, 100)
        setIsDatePickerVisible(true)
    }

    return (
        <>
            <View className="flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
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

                {/* Прокручиваемая часть контента */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
                >
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

                {/* Нижний блок */}
                <View className="pt-2 relative mb-2">
                    {/* Нижняя панель с иконками */}
                    <Animated.View
                        className="absolute bottom-0 left-0"
                        layout={Layout.duration(100)}
                    >
                        <View className="flex-row justify-start items-center gap-x-4">
                            <ProjectChoice
                                selectedProjectId={selectedProjectId}
                                onChangeSelectedProject={setSelectedProjectId}
                            />
                            <CalendarButton
                                date={selectedDate}
                                isActive={true}
                                onPress={handleDateButtonPress}
                                isTimeEnabled={task?.is_time_enabled}
                            />
                            <PriorityButton
                                priority={priority}
                                onPriorityChange={changePriority}
                            />
                        </View>
                    </Animated.View>

                    <Animated.View
                        className=" absolute bottom-0 right-4"
                        layout={Layout.duration(100)}
                    >
                        <Button
                            onPress={handleSubmit}
                            disabled={!title.trim() || createTask.isPending || updateTask.isPending}
                            leftIcon={mode === 'edit' ? 'Save' : 'Check'}
                            variant='outline'
                            size='lg'
                        />
                    </Animated.View>

                </View>
            </View>
            <DatePickerModal
                isVisible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                onSave={handleDateSelect}
                initialDate={new Date(selectedDate)}
                backdrop
                showTimePicker={task?.is_time_enabled}
            />
        </>
    )
}

export default NewTask