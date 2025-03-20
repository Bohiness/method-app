// src/shared/lib/tasks/tasks-storage.service.ts
import { storage } from '@shared/lib/storage/storage.service';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';
import { CreateTaskDtoType, TasksFiltersType, TaskType, UpdateTaskDtoType } from '@shared/types/plans/TasksTypes';

interface PendingChange {
    id: string;
    type: 'create' | 'update' | 'delete';
    timestamp: number;
    data?: any;
    taskId?: number;
    retryCount?: number;
    lastError?: string;
    status: 'pending' | 'failed' | 'synced';
}

interface LocalTask extends TaskType {
    serverId?: number;
    localId: number;
}

class TasksStorageService {
    private readonly TASKS_KEY = 'offline-tasks';
    private readonly PENDING_CHANGES_KEY = 'tasks-pending-changes';
    private readonly MAX_RETRIES = 3;
    private taskLocks: Map<number, boolean> = new Map();

    private acquireLock(taskId: number): boolean {
        if (this.taskLocks.get(taskId)) {
            return false;
        }
        this.taskLocks.set(taskId, true);
        return true;
    }

    private releaseLock(taskId: number): void {
        this.taskLocks.delete(taskId);
    }

    // Получение задачи по локальному ID
    async getTaskByLocalId(localId: number): Promise<LocalTask | null> {
        try {
            const tasks = (await storage.get<LocalTask[]>(this.TASKS_KEY)) || [];
            return tasks.find(task => task.localId === localId) || null;
        } catch (error) {
            console.error('Failed to get task by local ID:', error);
            return null;
        }
    }

    // Получение задачи по серверному ID
    async getTaskByServerId(serverId: number): Promise<LocalTask | null> {
        try {
            const tasks = (await storage.get<LocalTask[]>(this.TASKS_KEY)) || [];
            return tasks.find(task => task.serverId === serverId) || null;
        } catch (error) {
            console.error('Failed to get task by server ID:', error);
            return null;
        }
    }

    // Получение всех задач из локального хранилища
    async getTasks(filters?: TasksFiltersType): Promise<PaginatedResponse<TaskType[]>> {
        try {
            let tasks = (await storage.get<TaskType[]>(this.TASKS_KEY)) || [];

            if (filters) {
                tasks = this.applyFilters(tasks, filters);
            }

            return {
                count: tasks.length,
                next: null,
                previous: null,
                results: tasks,
            };
        } catch (error) {
            console.error('Failed to get tasks from storage:', error);
            return { count: 0, next: null, previous: null, results: [] };
        }
    }

    async createTask(data: CreateTaskDtoType): Promise<TaskType> {
        try {
            const tasks = (await storage.get<LocalTask[]>(this.TASKS_KEY)) || [];
            const localId = Date.now();

            const newTask: LocalTask = {
                localId,
                id: localId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...data,
            };

            tasks.unshift(newTask);
            await storage.set(this.TASKS_KEY, tasks);

            await this.savePendingChange({
                id: `create-${localId}`,
                type: 'create',
                timestamp: Date.now(),
                data: data,
                taskId: localId,
                status: 'pending',
            });

            return newTask;
        } catch (error) {
            console.error('Failed to create task in storage:', error);
            throw error;
        }
    }

    // Обновление задачи локально
    async updateTask(id: number, data: UpdateTaskDtoType): Promise<TaskType> {
        if (!this.acquireLock(id)) {
            throw new Error('Task is currently being updated');
        }

        try {
            const tasks = (await storage.get<LocalTask[]>(this.TASKS_KEY)) || [];
            const taskIndex = tasks.findIndex(task => task.id === id || task.localId === id || task.serverId === id);

            if (taskIndex === -1) {
                console.error('Task not found with id:', id);
                throw new Error('Task not found');
            }

            const existingTask = tasks[taskIndex];
            const updatedTask = {
                ...existingTask,
                ...data,
                id: existingTask.id,
                localId: existingTask.localId,
                serverId: existingTask.serverId || 0,
                updated_at: new Date().toISOString(),
                subtasks:
                    data.subtasks?.map(subtask => ({
                        ...subtask,
                        task: existingTask.id,
                        updated_at: new Date().toISOString(),
                    })) || existingTask.subtasks,
            };

            tasks[taskIndex] = updatedTask;
            await storage.set(this.TASKS_KEY, tasks);

            await this.savePendingChange({
                id: `update-${Date.now()}`,
                type: 'update',
                timestamp: Date.now(),
                data,
                taskId: existingTask.serverId || existingTask.id,
                status: 'pending',
            });

            return updatedTask;
        } catch (error) {
            console.error('Failed to update task in storage:', error);
            throw error;
        } finally {
            this.releaseLock(id);
        }
    }

    // Обновление серверного ID для локальной задачи
    async updateTaskServerId(localId: number, serverId: number): Promise<void> {
        try {
            const tasks = (await storage.get<LocalTask[]>(this.TASKS_KEY)) || [];
            const taskIndex = tasks.findIndex(task => task.localId === localId);

            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    serverId,
                    id: serverId,
                };
                await storage.set(this.TASKS_KEY, tasks);
            }
        } catch (error) {
            console.error('Failed to update task server ID:', error);
            throw error;
        }
    }

    // Удаление задачи локально
    // В tasksStorageService

    async deleteTask(id: number): Promise<void> {
        try {
            const tasks = (await storage.get<LocalTask[]>(this.TASKS_KEY)) || [];

            // Ищем задачу и по localId, и по serverId
            const taskToDelete = tasks.find(task => task.localId === id || task.serverId === id || task.id === id);

            if (!taskToDelete) {
                throw new Error('Task not found');
            }

            // Фильтруем по всем возможным идентификаторам
            const filteredTasks = tasks.filter(task => task.localId !== id && task.serverId !== id && task.id !== id);

            await storage.set(this.TASKS_KEY, filteredTasks);

            // Сохраняем изменение для синхронизации только если есть serverId
            if (taskToDelete.serverId) {
                await this.savePendingChange({
                    id: `delete-${Date.now()}`,
                    type: 'delete',
                    timestamp: Date.now(),
                    taskId: taskToDelete.serverId,
                    status: 'pending',
                });
            }
        } catch (error) {
            console.error('Failed to delete task from storage:', error);
            throw error;
        }
    }

    // Сохранение изменения для синхронизации
    private async savePendingChange(change: PendingChange): Promise<void> {
        try {
            const changes = (await storage.get<PendingChange[]>(this.PENDING_CHANGES_KEY)) || [];
            changes.push(change);
            await storage.set(this.PENDING_CHANGES_KEY, changes);
        } catch (error) {
            console.error('Failed to save pending change:', error);
            throw error;
        }
    }

    // Получение всех pending изменений
    async getPendingChanges(): Promise<PendingChange[]> {
        const changes = (await storage.get<PendingChange[]>(this.PENDING_CHANGES_KEY)) || [];
        return changes.filter(change => change.status === 'pending');
    }

    // Получение всех неудачных изменений
    async getFailedChanges(): Promise<PendingChange[]> {
        const changes = (await storage.get<PendingChange[]>(this.PENDING_CHANGES_KEY)) || [];
        return changes.filter(change => change.status === 'failed');
    }

    // Пометить изменение как неудачное
    async markChangeAsFailed(changeId: string, error: Error): Promise<void> {
        const changes = (await storage.get<PendingChange[]>(this.PENDING_CHANGES_KEY)) || [];
        const changeIndex = changes.findIndex(c => c.id === changeId);

        if (changeIndex !== -1) {
            const change = changes[changeIndex];
            change.status = 'failed';
            change.lastError = error.message;
            change.retryCount = (change.retryCount || 0) + 1;

            changes[changeIndex] = change;
            await storage.set(this.PENDING_CHANGES_KEY, changes);
        }
    }

    // Удалить изменение
    async removePendingChange(changeId: string): Promise<void> {
        const changes = (await storage.get<PendingChange[]>(this.PENDING_CHANGES_KEY)) || [];
        const filteredChanges = changes.filter(change => change.id !== changeId);
        await storage.set(this.PENDING_CHANGES_KEY, filteredChanges);
    }

    // Обновить локальные задачи данными с сервера
    async updateLocalTasks(serverTasks: TaskType[]): Promise<void> {
        try {
            const localTasks = (await storage.get<LocalTask[]>(this.TASKS_KEY)) || [];
            const pendingChanges = await this.getPendingChanges();

            // Создаем Map для быстрого поиска
            const serverTasksMap = new Map(serverTasks.map(task => [task.id, task]));
            const localTasksMap = new Map(localTasks.map(task => [task.localId, task]));

            const updatedTasks = serverTasks.map(serverTask => {
                const localTask = localTasks.find(lt => lt.serverId === serverTask.id);
                if (localTask) {
                    return {
                        ...serverTask,
                        localId: localTask.localId,
                        serverId: serverTask.id,
                    };
                }
                return {
                    ...serverTask,
                    localId: serverTask.id,
                    serverId: serverTask.id,
                };
            });

            // Добавляем локальные задачи, которые еще не синхронизированы
            localTasks.forEach(localTask => {
                if (!localTask.serverId) {
                    const hasPendingCreate = pendingChanges.some(
                        change => change.type === 'create' && change.taskId === localTask.localId
                    );
                    if (hasPendingCreate) {
                        updatedTasks.push(localTask);
                    }
                }
            });

            await storage.set(this.TASKS_KEY, updatedTasks);
        } catch (error) {
            console.error('Failed to update local tasks:', error);
            throw error;
        }
    }

    // Применение фильтров локально
    private applyFilters(tasks: TaskType[], filters: TasksFiltersType): TaskType[] {
        let filteredTasks = [...tasks];

        if (filters.status) {
            filteredTasks = filteredTasks.filter(task => task.status === filters.status);
        }

        if (filters.priority) {
            filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
        }

        if (typeof filters.is_completed === 'boolean') {
            filteredTasks = filteredTasks.filter(task => task.is_completed === filters.is_completed);
        }

        if (filters.project) {
            filteredTasks = filteredTasks.filter(task => task.project?.id === filters.project);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(searchLower));
        }

        if (filters.ordering) {
            const [field, direction] = filters.ordering.split(':');
            filteredTasks.sort((a: any, b: any) => {
                const aValue = a[field];
                const bValue = b[field];
                return direction === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
            });
        }

        return filteredTasks;
    }
}

export const tasksStorageService = new TasksStorageService();
