// src/shared/api/tasks/tasks-api.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { buildUrl } from '@shared/lib/url/buildUrl';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';
import { CreateProjectDtoType, ProjectType, UpdateProjectDtoType } from '@shared/types/plans/ProjectTypes';
import { CreateTaskDtoType, TasksFiltersType, TaskType, UpdateTaskDtoType } from '@shared/types/plans/TasksTypes';

class TasksApiService {
    // Методы для работы с задачами
    async getTasks(filters?: TasksFiltersType): Promise<PaginatedResponse<TaskType>> {
        const stringFilters = filters
            ? Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)]))
            : undefined;
        const url = buildUrl(API_ROUTES.PLANS.TASKS, undefined, stringFilters);
        return await apiClient.get<PaginatedResponse<TaskType>>(url);
    }

    async getTaskById(id: number): Promise<TaskType> {
        return await apiClient.get<TaskType>(API_ROUTES.PLANS.tasksById(id));
    }

    async createTask(data: CreateTaskDtoType): Promise<TaskType> {
        return await apiClient.post<TaskType>(API_ROUTES.PLANS.TASKS, data);
    }

    async updateTask(id: number, data: UpdateTaskDtoType): Promise<TaskType> {
        return await apiClient.patch<TaskType>(API_ROUTES.PLANS.tasksById(id), data);
    }

    async deleteTask(id: number): Promise<void> {
        await apiClient.delete(API_ROUTES.PLANS.tasksById(id));
    }

    async toggleTaskCompletion(id: number, isCompleted: boolean): Promise<TaskType> {
        return await apiClient.patch<TaskType>(API_ROUTES.PLANS.tasksById(id), {
            is_completed: isCompleted,
            status: isCompleted ? 'completed' : 'pending',
        });
    }

    // Методы для работы с проектами
    async getProjects(): Promise<PaginatedResponse<ProjectType>> {
        return await apiClient.get<PaginatedResponse<ProjectType>>(API_ROUTES.PLANS.PROJECTS);
    }

    async getProjectById(id: number): Promise<ProjectType> {
        return await apiClient.get<ProjectType>(API_ROUTES.PLANS.projectsById(id));
    }

    async createProject(data: CreateProjectDtoType): Promise<ProjectType> {
        return await apiClient.post<ProjectType>(API_ROUTES.PLANS.PROJECTS, data);
    }

    async updateProject(id: number, data: UpdateProjectDtoType): Promise<ProjectType> {
        return await apiClient.patch<ProjectType>(API_ROUTES.PLANS.projectsById(id), data);
    }

    async deleteProject(id: number): Promise<void> {
        await apiClient.delete(API_ROUTES.PLANS.projectsById(id));
    }
}

export const tasksApiService = new TasksApiService();
