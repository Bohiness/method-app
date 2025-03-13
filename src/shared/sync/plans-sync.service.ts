// src/shared/lib/sync/sync.service.ts
import { tasksApiService } from '@shared/api/plans/tasks-api.service';
import { storage } from '@shared/lib/storage/storage.service';
import {
    CreateProjectDtoType,
    CreateTaskDtoType,
    UpdateProjectDtoType,
    UpdateTaskDtoType,
} from '@shared/types/plans/TasksTypes';
import { QueryClient } from '@tanstack/react-query';

class PlansSyncService {
    async syncTasks(queryClient: QueryClient) {
        try {
            // Синхронизация созданных задач
            const createdTasks = (await storage.get<CreateTaskDtoType[]>('offline_tasks/create')) || [];
            for (const task of createdTasks) {
                await tasksApiService.createTask(task);
            }
            await storage.remove('offline_tasks/create');

            // Синхронизация обновленных задач
            const updatedTasks =
                (await storage.get<{ id: number; data: UpdateTaskDtoType }[]>('offline_tasks/update')) || [];
            for (const { id, data } of updatedTasks) {
                await tasksApiService.updateTask(id, data);
            }
            await storage.remove('offline_tasks/update');

            // Синхронизация удаленных задач
            const deletedTasks = (await storage.get<number[]>('offline_tasks/delete')) || [];
            for (const id of deletedTasks) {
                await tasksApiService.deleteTask(id);
            }
            await storage.remove('offline_tasks/delete');

            // Синхронизация проектов
            const createdProjects = (await storage.get<CreateProjectDtoType[]>('offline_projects/create')) || [];
            for (const project of createdProjects) {
                await tasksApiService.createProject(project);
            }
            await storage.remove('offline_projects/create');

            const updatedProjects =
                (await storage.get<{ id: number; data: UpdateProjectDtoType }[]>('offline_projects/update')) || [];
            for (const { id, data } of updatedProjects) {
                await tasksApiService.updateProject(id, data);
            }
            await storage.remove('offline_projects/update');

            // Обновляем кэш
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        } catch (error) {
            console.error('Failed to sync tasks:', error);
            throw error;
        }
    }
}

export const plansSyncService = new PlansSyncService();
