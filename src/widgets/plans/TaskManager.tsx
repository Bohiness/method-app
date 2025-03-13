import { ProjectChoice } from '@entities/plans/projects/ProjectChoise'
import { TabButton } from '@entities/plans/TabButton'
import { TasksList } from '@entities/plans/TasksList'
import { API_ROUTES } from '@shared/constants/api-routes'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { useProjects } from '@shared/hooks/plans/useProjects'
import { NotOnline } from '@shared/ui/system/NotOnline'
import { View } from '@shared/ui/view'
import { VoiceInputButton } from '@shared/ui/voice/VoiceInputButton'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Pressable } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated'

type Period = 'today' | 'tomorrow' | 'week' | 'later'

export const TaskManager = () => {
    const [activePeriod, setActivePeriod] = useState<Period>('today')
    const { tasks, isLoading, error, isOnline, toggleTask } = useOfflineTasks()
    const { selectedProjectId, onChangeSelectedProject } = useProjects()
    const { t } = useTranslation()
    const { syncTasks } = useOfflineTasks()
    const translateX = useSharedValue(0)
    const queryClient = useQueryClient()

    const switchPeriod = (direction: 'next' | 'prev') => {
        const currentIndex = periods.findIndex(p => p.id === activePeriod)
        let newIndex

        if (direction === 'next' && currentIndex < periods.length - 1) {
            newIndex = currentIndex + 1
        } else if (direction === 'prev' && currentIndex > 0) {
            newIndex = currentIndex - 1
        }

        if (newIndex !== undefined) {
            setActivePeriod(periods[newIndex].id as Period)
        }
    }

    const periods = [
        { id: 'today', title: t('common.date.today') },
        { id: 'tomorrow', title: t('common.date.tomorrow') },
        { id: 'week', title: t('common.date.week') },
        { id: 'later', title: t('common.date.later') }
    ]

    const getFilteredTasks = () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() + 7)

        // Сначала фильтруем по проекту, если он выбран
        const projectFilteredTasks = selectedProjectId
            ? tasks?.results.filter(task => task?.project === selectedProjectId)
            : tasks?.results

        switch (activePeriod) {
            case 'today':
                return projectFilteredTasks?.filter(task => {
                    const taskDate = new Date(task.start_datetime)
                    taskDate.setHours(0, 0, 0, 0)
                    return taskDate.getTime() === today.getTime()
                })
            case 'tomorrow':
                return projectFilteredTasks?.filter(task => {
                    const taskDate = new Date(task.start_datetime)
                    taskDate.setHours(0, 0, 0, 0)
                    return taskDate.getTime() === tomorrow.getTime()
                })
            case 'week':
                return projectFilteredTasks?.filter(task => {
                    const taskDate = new Date(task.start_datetime)
                    taskDate.setHours(0, 0, 0, 0)
                    return taskDate > tomorrow && taskDate <= weekEnd
                })
            case 'later':
                return projectFilteredTasks?.filter(task => {
                    const taskDate = new Date(task.start_datetime)
                    taskDate.setHours(0, 0, 0, 0)
                    return taskDate > weekEnd
                })
            default:
                return projectFilteredTasks
        }
    }

    // Настройка жестов
    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > 50) {
                if (event.translationX > 0) {
                    runOnJS(switchPeriod)('prev')
                } else {
                    runOnJS(switchPeriod)('next')
                }
            }
            translateX.value = withSpring(0)
        })


    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }))

    return (
        <View variant="default" className="flex-1 relative">
            {!isOnline && <NotOnline />}

            <View className="flex-row gap-x-4">
                {periods.map((period) => (
                    <TabButton
                        key={period.id}
                        title={period.title}
                        isActive={activePeriod === period.id}
                        onPress={() => setActivePeriod(period.id as Period)}
                    />
                ))}
            </View>

            {/* <HabitsList /> */}

            <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                    <TasksList
                        tasks={getFilteredTasks() ?? []}
                        onToggleTask={toggleTask}
                        isLoading={isLoading}
                        error={error}
                    />
                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: '/(modals)/(plans)/new-task',
                                params: {
                                    projectId: null
                                }
                            })
                        }}
                        className='flex-1'
                    />
                </Animated.View>
            </GestureDetector>

            <View className='absolute bottom-4 left-0'>
                <ProjectChoice
                    selectedProjectId={selectedProjectId}
                    onChangeSelectedProject={onChangeSelectedProject}
                />
            </View>

            <View className='absolute bottom-4 right-4'>
                <VoiceInputButton
                    url={API_ROUTES.PLANS.CREATE_VOICE_TASKS}
                    onTranscribe={(response) => {
                        console.log('response', response)
                        const tasksData = Array.isArray(response) ? response : (response?.tasks || [])

                        if (tasksData.length > 0) {
                            syncTasks()
                        }
                    }}
                />
            </View>

        </View>
    )
}

export default TaskManager