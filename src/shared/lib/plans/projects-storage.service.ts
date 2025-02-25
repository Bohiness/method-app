import { storage } from '@shared/lib/storage/storage.service';
import {
    CreateProjectDtoType,
    ProjectFiltersType,
    ProjectSyncOperation,
    ProjectType,
    UpdateProjectDtoType,
} from '@shared/types/plans/ProjectTypes';

class ProjectsStorageService {
    private readonly PROJECTS_KEY = 'offline_projects';
    private readonly SYNC_QUEUE_KEY = 'projects_sync_queue';

    async getProjects(filters?: ProjectFiltersType): Promise<ProjectType[]> {
        const projects = (await storage.get<ProjectType[]>(this.PROJECTS_KEY)) || [];

        if (filters?.search) {
            return projects.filter(
                project =>
                    project.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
                    project.description?.toLowerCase().includes(filters.search!.toLowerCase())
            );
        }

        return projects;
    }

    async getProjectById(id: number): Promise<ProjectType> {
        const projects = await this.getProjects();
        const project = projects.find(project => project.id === id);
        if (!project) {
            throw new Error('Project not found');
        }
        return project;
    }

    async createProject(data: CreateProjectDtoType): Promise<ProjectType> {
        const projects = await this.getProjects();
        const newProject: ProjectType = {
            id: Date.now(),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tasks_count: 0,
        };

        await storage.set(this.PROJECTS_KEY, [...projects, newProject]);
        await this.addToSyncQueue({
            type: 'create',
            data: data,
            timestamp: Date.now(),
        });

        return newProject;
    }

    async updateProject(id: number, data: UpdateProjectDtoType): Promise<ProjectType> {
        const projects = await this.getProjects();
        const projectIndex = projects.findIndex(project => project.id === id);

        if (projectIndex === -1) {
            throw new Error('Project not found');
        }

        const updatedProject = {
            ...projects[projectIndex],
            ...data,
            updated_at: new Date().toISOString(),
        };

        projects[projectIndex] = updatedProject;
        await storage.set(this.PROJECTS_KEY, projects);
        await this.addToSyncQueue({
            type: 'update',
            id,
            data,
            timestamp: Date.now(),
        });

        return updatedProject;
    }

    async deleteProject(id: number): Promise<void> {
        const projects = await this.getProjects();
        await storage.set(
            this.PROJECTS_KEY,
            projects.filter(project => project.id !== id)
        );
        await this.addToSyncQueue({
            type: 'delete',
            id,
            timestamp: Date.now(),
        });
    }

    private async addToSyncQueue(operation: ProjectSyncOperation): Promise<void> {
        const queue = (await storage.get<ProjectSyncOperation[]>(this.SYNC_QUEUE_KEY)) || [];
        await storage.set(this.SYNC_QUEUE_KEY, [...queue, operation]);
    }

    async getSyncQueue(): Promise<ProjectSyncOperation[]> {
        return (await storage.get<ProjectSyncOperation[]>(this.SYNC_QUEUE_KEY)) || [];
    }

    async clearSyncQueue(): Promise<void> {
        await storage.remove(this.SYNC_QUEUE_KEY);
    }
}

export const projectsStorageService = new ProjectsStorageService();
