// src/shared/lib/tasks/tasks-sync.service.ts
import { tasksApiService } from '@shared/api/plans/tasks-api.service';
import { networkService } from '@shared/lib/network/network.service';
import { SubTaskType } from '@shared/types/plans/TasksTypes';
import { AxiosError } from 'axios';
import { tasksStorageService } from './tasks-storage.service';

class TasksSyncService {
    private syncInterval: NodeJS.Timeout | null = null;
    private isSyncing: boolean = false;
    private syncQueue: Array<() => Promise<void>> = [];

    constructor() {
        networkService.addListener(this.handleNetworkChange);
        this.processSyncQueue();
    }

    private handleNetworkChange = (isConnected: boolean) => {
        if (isConnected) {
            console.debug('Network is back online, starting sync...');
            this.enqueueSyncTask();
        } else {
            console.debug('Network is offline, pausing sync');
            this.stopPeriodicSync();
        }
    };

    // Добавление задачи синхронизации в очередь
    private enqueueSyncTask() {
        const syncTask = async () => {
            try {
                if (!networkService.getConnectionStatus()) {
                    console.debug('No internet connection, skipping sync');
                    return;
                }

                const pendingChanges = await tasksStorageService.getPendingChanges();
                if (pendingChanges.length === 0) {
                    console.debug('No pending changes to sync');
                    return;
                }

                console.debug(`Starting sync of ${pendingChanges.length} changes`);
                const sortedChanges = pendingChanges.sort((a, b) => a.timestamp - b.timestamp);

                for (const change of sortedChanges) {
                    await this.processChange(change);
                }

                const serverTasks = await tasksApiService.getTasks();
                // Убедимся, что results - это массив
                if (Array.isArray(serverTasks.results)) {
                    await tasksStorageService.updateLocalTasks(serverTasks.results);
                } else {
                    console.error('Server tasks results is not an array:', serverTasks);
                }
            } catch (error) {
                console.error('Failed to sync changes:', error);
            }
        };

        this.syncQueue.push(syncTask);
    }

    // Обработка очереди синхронизации
    private async processSyncQueue() {
        while (true) {
            if (this.isSyncing || this.syncQueue.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            this.isSyncing = true;
            const syncTask = this.syncQueue.shift();

            if (syncTask) {
                try {
                    await syncTask();
                } catch (error) {
                    console.error('Sync task failed:', error);
                }
            }

            this.isSyncing = false;
        }
    }

    // Обработка отдельного изменения
    private async processChange(change: any) {
        try {
            switch (change.type) {
                case 'create':
                    console.log('create task', change.data);
                    // Создаем копию данных для изменения
                    const taskData = { ...change.data };

                    // Если есть подзадачи, убираем их id перед отправкой на сервер
                    if (taskData.subtasks?.length) {
                        taskData.subtasks = taskData.subtasks.map((subtask: SubTaskType) => ({
                            text: subtask.text,
                            // Другие поля подзадачи, если они есть, кроме id
                            status: subtask.status || 'pending',
                            is_completed: subtask.is_completed || false,
                        }));
                    }

                    const createdTask = await tasksApiService.createTask(taskData);
                    console.log('created task', createdTask);
                    await tasksStorageService.updateTaskServerId(change.taskId, createdTask.id);
                    break;

                case 'update':
                    if (change.taskId) {
                        const task = await tasksStorageService.getTaskByLocalId(change.taskId);
                        console.log('update task', task);
                        if (task?.serverId) {
                            const updateData = {
                                ...change.data,
                                subtasks: change.data.subtasks || task.subtasks,
                            };
                            console.log('update data', updateData);
                            await tasksApiService.updateTask(task.serverId, updateData);
                        }
                    }
                    break;

                case 'delete':
                    if (change.taskId) {
                        try {
                            console.debug('Processing delete change for task:', change.taskId);
                            await tasksApiService.deleteTask(change.taskId);
                            console.debug('Task deleted on server successfully');
                        } catch (error) {
                            // Проверяем, не была ли задача уже удалена
                            if (error instanceof AxiosError && error.response?.status === 404) {
                                console.debug('Task already deleted on server');
                            } else {
                                throw error;
                            }
                        }
                    }
                    break;
            }

            await tasksStorageService.removePendingChange(change.id);
        } catch (error) {
            console.error(`Failed to sync change:`, change, error);
            await tasksStorageService.markChangeAsFailed(change.id, error as Error);

            // Добавляем повторную попытку для важных операций
            if (change.type === 'delete' && change.retryCount < 3) {
                setTimeout(() => this.processChange(change), 5000);
            }
        }
    }

    // Новый метод для получения задач с сервера и обновления локального хранилища
    async fetchAndSyncTasks() {
        try {
            // Сначала синхронизируем все локальные изменения
            await this.syncChanges();

            // Затем получаем актуальные данные с сервера
            const serverTasks = await tasksApiService.getTasks();

            // Обновляем локальное хранилище
            // Убедимся, что results - это массив
            if (Array.isArray(serverTasks.results)) {
                await tasksStorageService.updateLocalTasks(serverTasks.results);
            } else {
                console.error('Server tasks results is not an array:', serverTasks);
            }

            return serverTasks;
        } catch (error) {
            console.error('Failed to fetch and sync tasks:', error);
            throw error;
        }
    }

    // Изменяем метод syncChanges, чтобы он возвращал Promise
    async syncChanges(): Promise<void> {
        return new Promise((resolve, reject) => {
            const syncTask = async () => {
                try {
                    if (!networkService.getConnectionStatus()) {
                        console.debug('No internet connection, skipping sync');
                        resolve();
                        return;
                    }

                    const pendingChanges = await tasksStorageService.getPendingChanges();
                    if (pendingChanges.length === 0) {
                        console.debug('No pending changes to sync');
                        resolve();
                        return;
                    }

                    console.debug(`Starting sync of ${pendingChanges.length} changes`);
                    const sortedChanges = pendingChanges.sort((a, b) => a.timestamp - b.timestamp);

                    for (const change of sortedChanges) {
                        await this.processChange(change);
                    }

                    resolve();
                } catch (error) {
                    console.error('Failed to sync changes:', error);
                    reject(error);
                }
            };

            this.syncQueue.push(syncTask);
        });
    }

    startPeriodicSync(intervalMs: number = 60000): () => void {
        if (this.syncInterval) {
            this.stopPeriodicSync();
        }

        this.syncInterval = setInterval(() => {
            if (networkService.getConnectionStatus()) {
                this.enqueueSyncTask();
            }
        }, intervalMs);

        return () => this.stopPeriodicSync();
    }

    stopPeriodicSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.debug('Stopped periodic sync');
        }
    }

    cleanup(): void {
        this.stopPeriodicSync();
        networkService.removeListener(this.handleNetworkChange);
    }
}

export const tasksSyncService = new TasksSyncService();
