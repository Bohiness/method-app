// src/shared/lib/tasks/tasks-sync.service.ts
import { tasksApiService } from '@shared/api/plans/tasks-api.service';
import { networkService } from '@shared/lib/network/network.service';
import { tasksStorageService } from './tasks-storage.service';

class TasksSyncService {
    private syncInterval: NodeJS.Timer | null = null;
    private isSyncing: boolean = false;
    private syncQueue: Array<() => Promise<void>> = [];

    constructor() {
        networkService.addListener(this.handleNetworkChange);
        this.processSyncQueue(); // Запускаем обработку очереди
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
                await tasksStorageService.updateLocalTasks(serverTasks.results);
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
                    const createdTask = await tasksApiService.createTask(change.data);
                    await tasksStorageService.updateTaskServerId(change.taskId, createdTask.id);
                    break;

                case 'update':
                    if (change.taskId) {
                        const task = await tasksStorageService.getTaskByLocalId(change.taskId);
                        if (task?.serverId) {
                            await tasksApiService.updateTask(task.serverId, change.data);
                        }
                    }
                    break;

                case 'delete':
                    if (change.taskId) {
                        const task = await tasksStorageService.getTaskByLocalId(change.taskId);
                        if (task?.serverId) {
                            await tasksApiService.deleteTask(task.serverId);
                        }
                    }
                    break;
            }

            await tasksStorageService.removePendingChange(change.id);
        } catch (error) {
            console.error(`Failed to sync change:`, change, error);
            await tasksStorageService.markChangeAsFailed(change.id, error);
        }
    }

    // Публичный метод для запуска синхронизации
    syncChanges(): void {
        this.enqueueSyncTask();
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
