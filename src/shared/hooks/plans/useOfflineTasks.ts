// src/shared/hooks/tasks/useOfflineTasks.ts
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { tasksStorageService } from '@shared/lib/plans/tasks-storage.service';
import { tasksSyncService } from '@shared/lib/plans/tasks-sync.service';
import { CreateTaskDtoType, TasksFiltersType, UpdateTaskDtoType } from '@shared/types/plans/TasksTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

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
                    await tasksSyncService.syncChanges();
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

    // Обновление задачи
    const updateTask = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateTaskDtoType }) => {
            // Сохраняем в локальное хранилище
            const updatedTask = await tasksStorageService.updateTask(id, data);

            // Если онлайн, пытаемся синхронизировать
            if (isOnline) {
                try {
                    await tasksSyncService.syncChanges();
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
            // Удаляем из локального хранилища
            await tasksStorageService.deleteTask(id);

            // Если онлайн, пытаемся синхронизировать
            if (isOnline) {
                try {
                    await tasksSyncService.syncChanges();
                } catch (error) {
                    console.error('Failed to sync after delete:', error);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const toggleTaskCompletion = useMutation({
        mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
            // Обновляем в локальном хранилище немедленно
            const updatedTask = await tasksStorageService.updateTask(id, {
                is_completed: isCompleted,
                status: isCompleted ? 'completed' : 'pending',
            });

            // Запускаем синхронизацию в фоне без await
            if (isOnline) {
                setTimeout(async () => {
                    try {
                        await tasksSyncService.syncChanges();
                    } catch (error) {
                        console.error('Failed to sync after status toggle:', error);
                    }
                }, 0);
            }

            return updatedTask;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Принудительная синхронизация
    const syncTasks = async () => {
        if (!isOnline) {
            throw new Error('No internet connection');
        }
        await tasksSyncService.syncChanges();
        queryClient.invalidateQueries({ queryKey });
    };

    return {
        tasks,
        isLoading,
        error,
        isOnline,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        syncTasks,
    };
};
