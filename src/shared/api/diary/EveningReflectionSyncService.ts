import { API_ROUTES } from '@shared/constants/api-routes';
import { EveningReflectionStorageService } from '@shared/lib/diary/EveningReflectionStorageService';
import { EveningReflection } from '@shared/types/diary/eveningreflection/EveningReflectionType';
import axios from 'axios';
export class EveningReflectionSyncService {
    private readonly API_URL = API_ROUTES.DIARY.EVENING_REFLECTION;
    private storageService: EveningReflectionStorageService;

    constructor(storageService: EveningReflectionStorageService) {
        this.storageService = storageService;
    }

    // Синхронизировать все изменения с сервером
    async syncChanges(): Promise<void> {
        try {
            const reflectionsToSync = await this.storageService.getAllEveningReflectionsForSync();
            if (reflectionsToSync.length === 0) return;

            const syncedIds: string[] = [];

            for (const reflection of reflectionsToSync) {
                try {
                    if (reflection.is_deleted) {
                        await this.deleteReflection(reflection.id);
                    } else if (await this.getReflection(reflection.id)) {
                        await this.updateReflection(reflection);
                    } else {
                        await this.createReflection(reflection);
                    }
                    syncedIds.push(reflection.id);
                } catch (error) {
                    console.error(`Failed to sync reflection ${reflection.id}:`, error);
                }
            }

            if (syncedIds.length > 0) {
                await this.storageService.markAsSynced(syncedIds);
            }
        } catch (error) {
            console.error('Failed to sync evening reflections:', error);
            throw error;
        }
    }

    // Получить все рефлексии с сервера
    async fetchAllReflections(): Promise<EveningReflection[]> {
        try {
            const response = await axios.get<EveningReflection[]>(this.API_URL);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch evening reflections:', error);
            throw error;
        }
    }

    // Получить конкретную рефлексию с сервера
    async getReflection(id: string): Promise<EveningReflection | null> {
        try {
            const response = await axios.get<EveningReflection>(`${this.API_URL}${id}/`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error(`Failed to get evening reflection ${id}:`, error);
            throw error;
        }
    }

    // Создать новую рефлексию на сервере
    async createReflection(reflection: EveningReflection): Promise<EveningReflection> {
        try {
            const { id, created_at, is_synced, is_deleted, ...data } = reflection;
            const response = await axios.post<EveningReflection>(this.API_URL, data);
            return response.data;
        } catch (error) {
            console.error('Failed to create evening reflection:', error);
            throw error;
        }
    }

    // Обновить существующую рефлексию на сервере
    async updateReflection(reflection: EveningReflection): Promise<EveningReflection> {
        try {
            const { id, is_synced, is_deleted, ...data } = reflection;
            const response = await axios.put<EveningReflection>(`${this.API_URL}${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Failed to update evening reflection ${reflection.id}:`, error);
            throw error;
        }
    }

    // Удалить рефлексию на сервере
    async deleteReflection(id: string): Promise<void> {
        try {
            await axios.delete(`${this.API_URL}${id}/`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return; // Если рефлексия не найдена на сервере, считаем удаление успешным
            }
            console.error(`Failed to delete evening reflection ${id}:`, error);
            throw error;
        }
    }
}
