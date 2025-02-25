import { projectsApiService } from '@shared/api/plans/projects-api.service';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { projectsStorageService } from '@shared/lib/plans/projects-storage.service';
import { storage } from '@shared/lib/storage/storage.service';
import { CreateProjectDtoType, ProjectFiltersType, UpdateProjectDtoType } from '@shared/types/plans/ProjectTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useProjects = (filters?: ProjectFiltersType) => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();
    const queryKey = ['projects', filters];
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    // Основной запрос для получения данных
    const {
        data: projects,
        isLoading,
        error,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            const localProjects = await projectsStorageService.getProjects(filters);

            if (isOnline) {
                syncProjects().catch(console.error);
            }

            return localProjects;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    });

    const syncProjects = async () => {
        if (!isOnline) return;

        try {
            // Обрабатываем очередь синхронизации
            const syncQueue = await projectsStorageService.getSyncQueue();
            for (const operation of syncQueue) {
                try {
                    switch (operation.type) {
                        case 'create':
                            if (operation.data) {
                                await projectsApiService.createProject(operation.data as CreateProjectDtoType);
                            }
                            break;
                        case 'update':
                            if (operation.id && operation.data) {
                                await projectsApiService.updateProject(
                                    operation.id,
                                    operation.data as UpdateProjectDtoType
                                );
                            }
                            break;
                        case 'delete':
                            if (operation.id) {
                                await projectsApiService.deleteProject(operation.id);
                            }
                            break;
                    }
                } catch (error) {
                    console.error('Sync operation failed:', error);
                }
            }

            // Получаем свежие данные с сервера
            const serverProjects = await projectsApiService.getProjects(filters);

            // Обновляем локальное хранилище и очищаем очередь
            await storage.set('offline_projects', serverProjects.results);
            await projectsStorageService.clearSyncQueue();

            // Обновляем кэш React Query
            queryClient.setQueryData(queryKey, serverProjects.results);
        } catch (error) {
            console.error('Projects sync failed:', error);
        }
    };

    useEffect(() => {
        if (isOnline) {
            syncProjects();
        }
    }, [isOnline]);

    // Мутации остаются без изменений...
    const createProject = useMutation({
        mutationFn: async (data: CreateProjectDtoType) => {
            const newProject = await projectsStorageService.createProject(data);
            if (isOnline) {
                try {
                    await syncProjects();
                } catch (error) {
                    console.error('Failed to sync after create:', error);
                }
            }
            return newProject;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const updateProject = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateProjectDtoType }) => {
            const updatedProject = await projectsStorageService.updateProject(id, data);
            if (isOnline) {
                try {
                    await syncProjects();
                } catch (error) {
                    console.error('Failed to sync after update:', error);
                }
            }
            return updatedProject;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteProject = useMutation({
        mutationFn: async (id: number) => {
            await projectsStorageService.deleteProject(id);
            if (isOnline) {
                try {
                    await syncProjects();
                } catch (error) {
                    console.error('Failed to sync after delete:', error);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const onChangeSelectedProject = (id: number | null) => {
        setSelectedProjectId(id);
    };

    return {
        projects,
        isLoading,
        error,
        isOnline,
        createProject,
        updateProject,
        deleteProject,
        syncProjects,
        selectedProjectId,
        onChangeSelectedProject,
    };
};

export const useProject = (id: number) => {
    const { projects } = useProjects();
    const {
        data: project,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectsStorageService.getProjectById(id),
        enabled: !!id,
        initialData: projects?.find(p => p.id === id),
    });

    return {
        project,
        isLoading,
        error,
    };
};
