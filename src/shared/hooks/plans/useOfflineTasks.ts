// src/shared/hooks/tasks/useOfflineTasks.ts
import { APP_ROUTES } from '@shared/constants/system/app-routes';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { tasksStorageService } from '@shared/lib/plans/tasks-storage.service';
import { tasksSyncService } from '@shared/lib/plans/tasks-sync.service';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';
import { CreateTaskDtoType, TasksFiltersType, TaskType, UpdateTaskDtoType } from '@shared/types/plans/TasksTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo, useRef } from 'react';
// Расширяем тип TaskType для локального использования
interface LocalTaskType extends TaskType {
    serverId?: number;
    localId?: number;
}

export const useOfflineTasks = (filters?: TasksFiltersType) => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();
    const queryKey = ['tasks', filters];
    const initialLoadRef = useRef(false);
    const backgroundSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const openNewTaskModal = () => {
        router.push(`/${APP_ROUTES.MODALS.PLANS.NEW_TASK}`);
    };

    // Включаем периодическую синхронизацию при монтировании компонента
    useEffect(() => {
        const cleanup = tasksSyncService.startPeriodicSync();
        return () => {
            cleanup();
            // Очищаем таймаут при размонтировании
            if (backgroundSyncTimeoutRef.current) {
                clearTimeout(backgroundSyncTimeoutRef.current);
            }
        };
    }, []);

    // Функция для фоновой синхронизации без блокировки UI
    const backgroundSync = useCallback(async () => {
        if (!isOnline) return;

        try {
            await tasksSyncService.syncChanges();
            // Тихое обновление кэша без перерисовки UI
            queryClient.invalidateQueries({ queryKey, exact: true });
        } catch (error) {
            console.error('Background sync failed:', error);
        }
    }, [isOnline, queryClient, queryKey]);

    // Запланировать фоновую синхронизацию
    const scheduleBackgroundSync = useCallback(
        (delayMs = 2000) => {
            if (backgroundSyncTimeoutRef.current) {
                clearTimeout(backgroundSyncTimeoutRef.current);
            }

            backgroundSyncTimeoutRef.current = setTimeout(() => {
                backgroundSync();
            }, delayMs);
        },
        [backgroundSync]
    );

    // Получение задач (из локального хранилища или с сервера)
    const {
        data: tasks,
        isLoading,
        error,
        refetch,
    } = useQuery<Promise<PaginatedResponse<TaskType[]>>>({
        queryKey,
        queryFn: async () => {
            // Сначала получаем данные из локального хранилища
            const localTasks = await tasksStorageService.getTasks(filters);

            // Если это первая загрузка и мы онлайн, запускаем фоновую синхронизацию
            if (!initialLoadRef.current && isOnline) {
                initialLoadRef.current = true;
                // Запускаем синхронизацию в фоне после возврата локальных данных
                scheduleBackgroundSync(500);
            }

            return localTasks;
        },
        // Отключаем автоматическое обновление при фокусе окна
        refetchOnWindowFocus: false,
        // Кэшируем данные на 5 минут
        staleTime: 5 * 60 * 1000,
    });

    // Создание задачи с оптимистическим обновлением
    const createTask = useMutation({
        mutationFn: async (data: CreateTaskDtoType) => {
            // Сохраняем в локальное хранилище
            const newTask = await tasksStorageService.createTask(data);
            return newTask;
        },
        onMutate: async newTaskData => {
            // Отменяем все текущие запросы для этого ключа
            await queryClient.cancelQueries({ queryKey });

            // Сохраняем предыдущее состояние
            const previousTasks = queryClient.getQueryData(queryKey);

            // Оптимистически обновляем UI
            queryClient.setQueryData(queryKey, (old: any) => {
                const tempTask = {
                    id: Date.now(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    ...newTaskData,
                };

                return {
                    ...old,
                    results: [tempTask, ...(old?.results || [])],
                    count: (old?.count || 0) + 1,
                };
            });

            return { previousTasks };
        },
        onSuccess: newTask => {
            // Обновляем кэш с реальными данными
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return { count: 1, results: [newTask], next: null, previous: null };

                // Заменяем временную задачу на реальную
                const updatedResults = old.results.map((task: LocalTaskType) =>
                    // Если id совпадает с временным или это новая задача с тем же текстом
                    task.id === newTask.id || (task.text === newTask.text && !task.serverId) ? newTask : task
                );

                return {
                    ...old,
                    results: updatedResults,
                };
            });

            // Запускаем фоновую синхронизацию
            if (isOnline) {
                scheduleBackgroundSync();
            }
        },
        onError: (error, variables, context) => {
            console.error('Failed to create task:', error);
            // Откатываем к предыдущему состоянию
            if (context?.previousTasks) {
                queryClient.setQueryData(queryKey, context.previousTasks);
            }
        },
    });

    // Получение задачи по ID с автоматической загрузкой из хранилища
    const getTaskById = useCallback(
        (taskId: number) => {
            return useQuery({
                queryKey: ['task', taskId],
                queryFn: async () => {
                    // Сначала пробуем получить по локальному ID
                    let task = await tasksStorageService.getTaskByLocalId(taskId);

                    // Если не нашли, пробуем по серверному ID
                    if (!task) {
                        task = await tasksStorageService.getTaskByServerId(taskId);
                    }

                    if (!task) {
                        throw new Error(`Task with ID ${taskId} not found`);
                    }

                    // Если мы онлайн, запускаем фоновую синхронизацию для обновления данных
                    if (isOnline) {
                        scheduleBackgroundSync();
                    }

                    return task;
                },
                enabled: !!taskId,
                // Кэшируем данные на 2 минуты
                staleTime: 2 * 60 * 1000,
            });
        },
        [isOnline, scheduleBackgroundSync]
    );

    // Обновление задачи с оптимистическим обновлением
    const updateTask = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateTaskDtoType }) => {
            // Сохраняем в локальное хранилище
            const updatedTask = await tasksStorageService.updateTask(id, data);
            return updatedTask;
        },
        onMutate: async ({ id, data }) => {
            // Отменяем все текущие запросы для этого ключа
            await queryClient.cancelQueries({ queryKey });
            await queryClient.cancelQueries({ queryKey: ['task', id] });

            // Сохраняем предыдущее состояние
            const previousTasks = queryClient.getQueryData(queryKey);
            const previousTask = queryClient.getQueryData(['task', id]);

            // Оптимистически обновляем UI для списка задач
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    results: old.results.map((task: TaskType) =>
                        task.id === id ? { ...task, ...data, updated_at: new Date().toISOString() } : task
                    ),
                };
            });

            // Оптимистически обновляем UI для отдельной задачи
            queryClient.setQueryData(['task', id], (old: any) => {
                if (!old) return old;
                return { ...old, ...data, updated_at: new Date().toISOString() };
            });

            return { previousTasks, previousTask };
        },
        onSuccess: updatedTask => {
            // Обновляем кэш с реальными данными
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    results: old.results.map((task: TaskType) => (task.id === updatedTask.id ? updatedTask : task)),
                };
            });

            // Обновляем кэш для отдельной задачи
            queryClient.setQueryData(['task', updatedTask.id], updatedTask);

            // Запускаем фоновую синхронизацию
            if (isOnline) {
                scheduleBackgroundSync();
            }
        },
        onError: (error, variables, context) => {
            console.error('Failed to update task:', error);
            // Откатываем к предыдущему состоянию
            if (context?.previousTasks) {
                queryClient.setQueryData(queryKey, context.previousTasks);
            }
            if (context?.previousTask) {
                queryClient.setQueryData(['task', variables.id], context.previousTask);
            }
        },
    });

    // Удаление задачи с оптимистическим обновлением
    const deleteTask = useMutation({
        mutationFn: async (id: number) => {
            await tasksStorageService.deleteTask(id);
            return id;
        },
        onMutate: async id => {
            // Отменяем все текущие запросы для этого ключа
            await queryClient.cancelQueries({ queryKey });

            // Сохраняем предыдущее состояние
            const previousTasks = queryClient.getQueryData(queryKey);

            // Оптимистически обновляем UI
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    results: old.results.filter((task: TaskType) => task.id !== id),
                    count: Math.max(0, old.count - 1),
                };
            });

            return { previousTasks };
        },
        onSuccess: id => {
            // Удаляем задачу из кэша
            queryClient.removeQueries({ queryKey: ['task', id] });

            // Запускаем фоновую синхронизацию
            if (isOnline) {
                scheduleBackgroundSync();
            }
        },
        onError: (error, id, context) => {
            console.error('Delete mutation failed:', error);
            // Откатываем к предыдущему состоянию
            if (context?.previousTasks) {
                queryClient.setQueryData(queryKey, context.previousTasks);
            }
        },
    });

    // Переключение статуса задачи с оптимистическим обновлением
    const toggleTaskCompletion = useMutation({
        mutationFn: async (taskId: string | number) => {
            const numericId = Number(taskId);

            // Получаем актуальное состояние задачи из локального хранилища
            const task =
                (await tasksStorageService.getTaskByLocalId(numericId)) ||
                (await tasksStorageService.getTaskByServerId(numericId));

            if (!task) {
                throw new Error('Task not found');
            }

            const isCompleted = !task.is_completed;

            // Обновляем в локальном хранилище
            const updatedTask = await tasksStorageService.updateTask(numericId, {
                is_completed: isCompleted,
                status: isCompleted ? 'completed' : 'pending',
            });

            return updatedTask;
        },
        onMutate: async taskId => {
            const numericId = Number(taskId);

            // Отменяем все текущие запросы для этого ключа
            await queryClient.cancelQueries({ queryKey });
            await queryClient.cancelQueries({ queryKey: ['task', numericId] });

            // Сохраняем предыдущее состояние
            const previousTasks = queryClient.getQueryData(queryKey);
            const previousTask = queryClient.getQueryData(['task', numericId]);

            // Получаем текущее состояние задачи
            const tasks = queryClient.getQueryData<{ results: TaskType[] }>(queryKey);
            const task = tasks?.results.find(t => t.id === numericId);

            if (!task) return { previousTasks, previousTask };

            const isCompleted = !task.is_completed;
            const timestamp = new Date().toISOString();

            // Создаем обновленную задачу
            const updatedTask = {
                ...task,
                is_completed: isCompleted,
                status: isCompleted ? 'completed' : 'pending',
                updated_at: timestamp,
            };

            // Оптимистически обновляем UI для списка задач
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old || !old.results) return old;

                return {
                    ...old,
                    results: old.results.map((t: TaskType) => (t.id === numericId ? updatedTask : t)),
                };
            });

            // Оптимистически обновляем UI для отдельной задачи
            queryClient.setQueryData(['task', numericId], updatedTask);

            return { previousTasks, previousTask, updatedTask };
        },
        onSuccess: (updatedTask, taskId, context) => {
            // Обновляем кэш с реальными данными
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old || !old.results) return old;

                return {
                    ...old,
                    results: old.results.map((task: TaskType) => (task.id === updatedTask.id ? updatedTask : task)),
                };
            });

            // Обновляем кэш для отдельной задачи
            queryClient.setQueryData(['task', updatedTask.id], updatedTask);

            // Запускаем дебаунсированную синхронизацию если онлайн
            if (isOnline) {
                debouncedSync();
            }
        },
        onError: (error, taskId, context) => {
            console.error('Error toggling task completion:', error);

            // Откатываем к предыдущему состоянию
            if (context?.previousTasks) {
                queryClient.setQueryData(queryKey, context.previousTasks);
            }

            const numericId = Number(taskId);
            if (context?.previousTask) {
                queryClient.setQueryData(['task', numericId], context.previousTask);
            }
        },
    });

    // Создаем дебаунсированную функцию синхронизации
    const debouncedSync = useMemo(
        () =>
            debounce(async () => {
                try {
                    // Сохраняем текущее состояние задач перед синхронизацией
                    const currentTasks = queryClient.getQueryData(queryKey);

                    // Выполняем синхронизацию
                    await tasksSyncService.syncChanges();

                    // Получаем обновленные задачи из локального хранилища
                    const updatedLocalTasks = await tasksStorageService.getTasks(filters);

                    // Обновляем кэш с сохранением порядка и состояния задач
                    queryClient.setQueryData(queryKey, (old: any) => {
                        if (!old) return updatedLocalTasks;

                        // Создаем карту задач для быстрого поиска
                        const updatedTasksMap = new Map<number, TaskType>();
                        if (updatedLocalTasks.results && Array.isArray(updatedLocalTasks.results)) {
                            updatedLocalTasks.results.forEach((task: TaskType) => {
                                updatedTasksMap.set(task.id, task);
                            });
                        }

                        // Обновляем существующие задачи, сохраняя порядок
                        const mergedResults = old.results.map((task: TaskType) => {
                            const updatedTask = updatedTasksMap.get(task.id);
                            return updatedTask || task;
                        });

                        return {
                            ...updatedLocalTasks,
                            results: mergedResults,
                        };
                    });
                } catch (error) {
                    console.error('Failed to sync after status toggle:', error);
                }
            }, 1000),
        [queryClient, queryKey, filters]
    );

    // Принудительная синхронизация с обновлением UI
    const syncTasks = async () => {
        if (!isOnline) {
            throw new Error('No internet connection');
        }

        try {
            // Сохраняем текущее состояние задач перед синхронизацией
            const currentTasks = queryClient.getQueryData(queryKey);

            // Получаем задачи с сервера
            const serverTasks = await tasksSyncService.fetchAndSyncTasks();

            // Получаем обновленные задачи из локального хранилища после синхронизации
            const localTasks = await tasksStorageService.getTasks(filters);

            // Обновляем кэш запроса с новыми данными, сохраняя порядок и состояние задач
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return localTasks;

                // Создаем карту задач для быстрого поиска
                const updatedTasksMap = new Map<number, TaskType>();
                if (localTasks.results && Array.isArray(localTasks.results)) {
                    localTasks.results.forEach((task: TaskType) => {
                        updatedTasksMap.set(task.id, task);
                    });
                }

                // Обновляем существующие задачи, сохраняя порядок
                const mergedResults = old.results.map((task: TaskType) => {
                    const updatedTask = updatedTasksMap.get(task.id);
                    return updatedTask || task;
                });

                // Добавляем новые задачи, которых не было в старом списке
                if (localTasks.results && Array.isArray(localTasks.results)) {
                    localTasks.results.forEach((task: TaskType) => {
                        const exists = old.results.some((t: TaskType) => t.id === task.id);
                        if (!exists) {
                            mergedResults.unshift(task); // Добавляем новые задачи в начало списка
                        }
                    });
                }

                return {
                    ...localTasks,
                    results: mergedResults,
                };
            });

            return serverTasks;
        } catch (error) {
            console.error('Failed to sync tasks:', error);
            throw error;
        }
    };

    // Функция для ручного обновления списка задач
    const refreshTasks = async () => {
        try {
            if (isOnline) {
                // Если онлайн, выполняем полную синхронизацию
                return await syncTasks();
            } else {
                // Если оффлайн, просто обновляем из локального хранилища
                const localTasks = await tasksStorageService.getTasks(filters);

                // Обновляем кэш с сохранением порядка
                queryClient.setQueryData(queryKey, (old: any) => {
                    if (!old) return localTasks;

                    // Создаем карту задач для быстрого поиска
                    const updatedTasksMap = new Map<number, TaskType>();
                    if (localTasks.results && Array.isArray(localTasks.results)) {
                        localTasks.results.forEach((task: TaskType) => {
                            updatedTasksMap.set(task.id, task);
                        });
                    }

                    // Обновляем существующие задачи, сохраняя порядок
                    const mergedResults = old.results.map((task: TaskType) => {
                        const updatedTask = updatedTasksMap.get(task.id);
                        return updatedTask || task;
                    });

                    return {
                        ...localTasks,
                        results: mergedResults,
                    };
                });

                return localTasks;
            }
        } catch (error) {
            console.error('Failed to refresh tasks:', error);
            // В случае ошибки, пробуем получить данные из локального хранилища
            return refetch();
        }
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
        openNewTaskModal,
        toggleTask: (taskId: string | number) => toggleTaskCompletion.mutate(taskId),
        isToggling: toggleTaskCompletion.isPending,
        syncTasks,
        refreshTasks,
    };
};
