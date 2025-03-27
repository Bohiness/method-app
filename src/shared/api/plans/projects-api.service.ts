import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { buildUrl } from '@shared/lib/url/buildUrl';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';
import {
    CreateProjectDtoType,
    ProjectFiltersType,
    ProjectType,
    UpdateProjectDtoType,
} from '@shared/types/plans/ProjectTypes';

class ProjectsApiService {
    async getProjects(filters?: ProjectFiltersType): Promise<PaginatedResponse<ProjectType>> {
        const url = buildUrl(API_ROUTES.PLANS.PROJECTS, undefined, filters);
        return await apiClient.get<PaginatedResponse<ProjectType>>(url);
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

export const projectsApiService = new ProjectsApiService();
