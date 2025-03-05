// src/shared/hooks/tasks/useOfflineTasks.ts
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { tasksStorageService } from '@shared/lib/plans/tasks-storage.service';
import { tasksSyncService } from '@shared/lib/plans/tasks-sync.service';
import { CreateTaskDtoType, TasksFiltersType, TaskType, UpdateTaskDtoType } from '@shared/types/plans/TasksTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';

export const useOfflineTasks = (filters?: TasksFiltersType) => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();
    const queryKey = ['tasks', filters];

    // Включаем периодическую синхронизацию при монтировании компонента
    useEffect(() => {
        const cleanup = tasksSyncService.startPeriodicSync();
        return cleanup;
    }, []);

    // Получение задач (из локального хранилища или с сервера)
    const {
        data: tasks,
        isLoading,
        error,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            if (isOnline) {
                // Если есть интернет, пробуем синхронизировать изменения
                try {
                    await tasksSyncService.syncChanges();
                } catch (error) {
                    console.error('Failed to sync changes:', error);
                }
            }
            // В любом случае возвращаем данные из локального хранилища
            return tasksStorageService.getTasks(filters);
        },
    });

    // Создание задачи
    const createTask = useMutation({
        mutationFn: async (data: CreateTaskDtoType) => {
            // Сохраняем в локальное хранилище
            const newTask = await tasksStorageService.createTask(data);

            // Если онлайн, пытаемся синхронизировать
            if (isOnline) {
                try {
                    tasksSyncService.syncChanges();
                } catch (error) {
                    console.error('Failed to sync after create:', error);
                }
            }

            return newTask;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Получение задачи по ID
    const getTaskById = (taskId: number) => {
        return useQuery({
            queryKey: ['task', taskId],
            queryFn: async () => {
                // Сначала пробуем получить по локальному ID
                let task = await tasksStorageService.getTaskByLocalId(taskId);

                // Если не нашли, пробуем по серверному ID
                if (!task && isOnline) {
                    task = await tasksStorageService.getTaskByServerId(taskId);
                }

                if (!task) {
                    throw new Error(`Task with ID ${taskId} not found`);
                }

                return task;
            },
            enabled: !!taskId,
        });
    };

    // Обновление задачи
    const updateTask = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateTaskDtoType }) => {
            // Сохраняем в локальное хранилище
            const updatedTask = await tasksStorageService.updateTask(id, data);

            // Если онлайн, пытаемся синхронизировать
            if (isOnline) {
                try {
                    tasksSyncService.syncChanges();
                } catch (error) {
                    console.error('Failed to sync after update:', error);
                }
            }

            return updatedTask;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Удаление задачи
    const deleteTask = useMutation({
        mutationFn: async (id: number) => {
            try {
                await tasksStorageService.deleteTask(id);

                // Если онлайн, пытаемся синхронизировать
                if (isOnline) {
                    try {
                        tasksSyncService.syncChanges();
                    } catch (error) {
                        // Добавляем повторную попытку синхронизации
                        setTimeout(() => tasksSyncService.syncChanges(), 5000);
                    }
                }
            } catch (error) {
                console.error('Error in deleteTask mutation:', error);
                throw error;
            }
        },
        onSuccess: () => {
            console.debug('Delete mutation succeeded, invalidating queries');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: error => {
            console.error('Delete mutation failed:', error);
            // Можно добавить показ уведомления пользователю
        },
    });

    const toggleTaskCompletion = useMutation({
        mutationFn: async (taskId: string | number) => {
            try {
                const tasks = queryClient.getQueryData<{ results: TaskType[] }>(queryKey);
                const task = tasks?.results.find(t => t.id === Number(taskId));

                if (!task) {
                    throw new Error('Task not found');
                }

                const isCompleted = !task.is_completed;

                // Оптимистическое обновление UI
                queryClient.setQueryData(queryKey, (old: any) => ({
                    ...old,
                    results: old.results.map((t: TaskType) =>
                        t.id === Number(taskId)
                            ? { ...t, is_completed: isCompleted, status: isCompleted ? 'completed' : 'pending' }
                            : t
                    ),
                }));

                // Обновляем в локальном хранилище
                const updatedTask = await tasksStorageService.updateTask(task.id, {
                    is_completed: isCompleted,
                    status: isCompleted ? 'completed' : 'pending',
                });

                // Запускаем дебаунсированную синхронизацию если онлайн
                if (isOnline) {
                    debouncedSync();
                }

                return updatedTask;
            } catch (error) {
                // В случае ошибки отменяем оптимистическое обновление
                queryClient.invalidateQueries({ queryKey });
                throw error;
            }
        },
        onError: (error, taskId) => {
            console.error('Error toggling task completion:', error);
            // Можно добавить уведомление пользователю
        },
    });

    // Создаем дебаунсированную функцию синхронизации
    const debouncedSync = useMemo(
        () =>
            debounce(async () => {
                try {
                    await tasksSyncService.syncChanges();
                    queryClient.invalidateQueries({ queryKey });
                } catch (error) {
                    console.error('Failed to sync after status toggle:', error);
                }
            }, 1000),
        [queryClient, queryKey]
    );

    // Принудительная синхронизация
    const syncTasks = async () => {
        if (!isOnline) {
            throw new Error('No internet connection');
        }

        // Получаем задачи с сервера
        const serverTasks = await tasksSyncService.fetchAndSyncTasks();

        // Обновляем кэш запроса с новыми данными
        queryClient.setQueryData(queryKey, {
            count: serverTasks.count,
            next: serverTasks.next,
            previous: serverTasks.previous,
            results: serverTasks.results,
        });

        // Также инвалидируем запрос для обновления UI
        queryClient.invalidateQueries({ queryKey });

        return serverTasks;
    };

    return {
        tasks,
        isLoading,
        error,
        isOnline,
        createTask,
        updateTask,
        deleteTask,
        getTaskById,
        toggleTask: (taskId: string | number) => toggleTaskCompletion.mutate(taskId),
        isToggling: toggleTaskCompletion.isPending,
        syncTasks,
    };
};
