import { TabButton } from '@entities/plans/TabButton'
import { TasksList } from '@entities/plans/TasksList'
import { useModal } from '@shared/context/modal-provider'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { Text } from '@shared/ui/text'
import { View as ThemedView, View } from '@shared/ui/view'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import NewTask from './NewTask'

type Period = 'today' | 'tomorrow' | 'week' | 'later'

export const TasksPeriodNavigation = () => {
    const [activePeriod, setActivePeriod] = useState<Period>('today')
    const { tasks, isLoading, error, isOnline, toggleTaskCompletion } = useOfflineTasks()
    const { showBottomSheet } = useModal()
    const { t } = useTranslation()

    const periods = [
        { id: 'today', title: t('today') },
        { id: 'tomorrow', title: t('tomorrow') },
        { id: 'week', title: t('week') },
        { id: 'later', title: t('later') }
    ]

    const getFilteredTasks = () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() + 7)

        switch (activePeriod) {
            case 'today':
                return tasks?.results.filter(task => {
                    const taskDate = new Date(task.start_date)
                    taskDate.setHours(0, 0, 0, 0)
                    return taskDate.getTime() === today.getTime()
                })
            case 'tomorrow':
                return tasks?.results.filter(task => {
                    const taskDate = new Date(task.start_date)
                    taskDate.setHours(0, 0, 0, 0)
                    return taskDate.getTime() === tomorrow.getTime()
                })
            case 'week':
                return tasks?.results.filter(task => {
                    const taskDate = new Date(task.start_date)
                    return taskDate >= today && taskDate <= weekEnd
                })
            case 'later':
                return tasks?.results.filter(task => {
                    const taskDate = new Date(task.start_date)
                    return taskDate > weekEnd
                })
            default:
                return tasks?.results
        }
    }

    const handleToggleTask = async (taskId: string) => {
        try {
            const task = tasks?.results.find(t => t.id === Number(taskId))
            if (task) {
                await toggleTaskCompletion.mutateAsync({
                    id: task.id,
                    isCompleted: !task.is_completed
                })
            }
        } catch (error) {
            console.error('Error toggling task:', error)
        }
    }

    return (
        <ThemedView variant="default" className="flex-1">
            {!isOnline && (
                <View className="bg-warning/20 px-4 py-2 mb-2">
                    <Text className="text-sm text-warning">
                        {t('common.offlineMode')}
                    </Text>
                </View>
            )}

            <View className="flex-row py-2 gap-x-4">
                {periods.map((period) => (
                    <TabButton
                        key={period.id}
                        title={period.title}
                        isActive={activePeriod === period.id}
                        onPress={() => setActivePeriod(period.id as Period)}
                    />
                ))}
            </View>

            <TasksList
                tasks={getFilteredTasks() ?? []}
                onToggleTask={handleToggleTask}
                isLoading={isLoading}
                error={error}
            />
            <Pressable
                onPress={() => {
                    showBottomSheet(
                        <NewTask
                            mode="create"
                        />
                    )
                }}
                className='flex-1'
            />
        </ThemedView>
    )
}

export default TasksPeriodNavigation