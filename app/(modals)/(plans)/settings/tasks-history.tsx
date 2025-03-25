import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { PaginatedResponse } from '@shared/types/PaginatedResponse'
import { TaskStatus, TaskType } from '@shared/types/plans/TasksTypes'
import { Button } from '@shared/ui/button'
import { Icon, IconName } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from "@shared/ui/view"
import { format } from 'date-fns'
import { useState } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'

export default function TasksHistory() {
    // Состояние пагинации
    const [page, setPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    // Фильтры для получения всех задач с пагинацией
    const filters = {
        page,
        page_size: ITEMS_PER_PAGE,
        // Включаем все задачи, включая завершенные
        status: 'all' as TaskStatus
    }

    const {
        tasks: tasksResponsePromise,
        isLoading,
        error,
        refreshTasks
    } = useOfflineTasks(filters)

    // Преобразуем tasksResponsePromise в правильный тип
    const tasksResponse = tasksResponsePromise as unknown as PaginatedResponse<TaskType[]>

    // Обработчики пагинации
    const handleNextPage = () => {
        if (tasksResponse && tasksResponse.next) {
            setPage(prevPage => prevPage + 1)
        }
    }

    const handlePrevPage = () => {
        if (tasksResponse && tasksResponse.previous && page > 1) {
            setPage(prevPage => prevPage - 1)
        }
    }

    // Форматирование даты задачи
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd.MM.yyyy HH:mm')
        } catch (e) {
            return dateString
        }
    }

    // Отображение задачи
    const renderTask = ({ item }: { item: TaskType }) => (
        <View
            variant="paper"
            className="p-4 mb-2 rounded-lg border border-border dark:border-border-dark"
        >
            <View className="flex-row justify-between mb-1">
                <Text
                    size="base"
                    weight={item.is_completed ? 'normal' : 'medium'}
                    variant={item.is_completed ? 'secondary' : 'default'}
                    className={item.is_completed ? 'line-through' : ''}
                >
                    {item.text}
                </Text>
                <View
                    variant="transparent"
                    className={`px-2 py-0.5 rounded ${item.is_completed
                        ? 'bg-success dark:bg-success-dark'
                        : 'bg-tint dark:bg-tint-dark'
                        }`}
                >
                    <Text size="xs" weight="medium" variant="defaultInverted">
                        {item.is_completed ? 'task_status_completed' : 'task_status_pending'}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between mt-2">
                <Text size="xs" variant="secondary">
                    {'task_created_at'}: {formatDate(item.created_at)}
                </Text>
                {item.updated_at !== item.created_at && (
                    <Text size="xs" variant="secondary">
                        {'task_updated_at'}: {formatDate(item.updated_at)}
                    </Text>
                )}
            </View>
        </View>
    )

    // Если загрузка - показываем индикатор
    if (isLoading && !tasksResponse) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    // Если ошибка - показываем сообщение
    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Icon name={'AlertCircle' as IconName} size={24} variant="error" />
                <Text variant="error" size="base" className="mt-2">
                    {'tasks_history_error'}
                </Text>
                <Button
                    variant="default"
                    size="md"
                    className="mt-4"
                    onPress={() => refreshTasks()}
                >
                    <Text variant="defaultInverted" weight="medium">
                        {'tasks_history_retry'}
                    </Text>
                </Button>
            </View>
        )
    }

    const hasResults = tasksResponse && tasksResponse.results && Array.isArray(tasksResponse.results) && tasksResponse.results.length > 0

    return (
        <View className="flex-1 p-4">
            <View className="flex-row justify-between items-center mb-6">
                <Text size="xl" weight="bold">
                    {'tasks_history_title'}
                </Text>
                <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => refreshTasks()}
                    rightIcon={'RefreshCw' as IconName}
                >
                    <Text variant="tint" weight="medium">
                        {'tasks_history_refresh'}
                    </Text>
                </Button>
            </View>

            {hasResults ? (
                <>
                    <FlatList
                        data={tasksResponse.results as TaskType[]}
                        renderItem={renderTask}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        className="mb-4"
                    />

                    {/* Пагинация */}
                    <View className="flex-row justify-between items-center py-2">
                        <Text variant="secondary" size="sm">
                            {'tasks_page'} {page} {'tasks_of'} {Math.ceil((tasksResponse.count || 0) / ITEMS_PER_PAGE)}
                        </Text>
                        <View className="flex-row">
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={'ChevronLeft' as IconName}
                                disabled={!tasksResponse.previous || page <= 1}
                                onPress={handlePrevPage}
                                className="mr-2"
                            >
                                <Text>{'tasks_prev'}</Text>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                rightIcon={'ChevronRight' as IconName}
                                disabled={!tasksResponse.next}
                                onPress={handleNextPage}
                            >
                                <Text>{'tasks_next'}</Text>
                            </Button>
                        </View>
                    </View>
                </>
            ) : (
                <View className="flex-1 justify-center items-center p-4">
                    <Icon name={'Inbox' as IconName} size={48} variant="secondary" />
                    <Text variant="secondary" size="base" className="mt-4 text-center">
                        {'tasks_history_empty'}
                    </Text>
                </View>
            )}
        </View>
    )
}