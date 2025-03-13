import { API_ROUTES } from '@shared/constants/api-routes';
import { StartDayStorageService } from '@shared/lib/diary/StartData.storage-service';
import { StartDayType } from '@shared/types/diary/startday/StartDayType';
import axios from 'axios';

export class StartDaySyncService {
    private readonly API_URL = API_ROUTES.DIARY.START_DAY;
    private storageService: StartDayStorageService;

    constructor(storageService: StartDayStorageService) {
        this.storageService = storageService;
    }

    // Синхронизировать все изменения с сервером
    async syncChanges(): Promise<void> {
        try {
            const startDaysToSync = await this.storageService.getAllStartDaysForSync();
            if (startDaysToSync.length === 0) return;

            const syncedIds: string[] = [];

            for (const startDay of startDaysToSync) {
                try {
                    if (startDay.is_deleted) {
                        await this.deleteStartDay(startDay.id);
                    } else if (await this.getStartDay(startDay.id)) {
                        await this.updateStartDay(startDay);
                    } else {
                        await this.createStartDay(startDay);
                    }
                    syncedIds.push(startDay.id);
                } catch (error) {
                    console.error(`Failed to sync start day ${startDay.id}:`, error);
                }
            }

            if (syncedIds.length > 0) {
                await this.storageService.markAsSynced(syncedIds);
            }
        } catch (error) {
            console.error('Failed to sync start days:', error);
            throw error;
        }
    }

    // Получить все записи начала дня с сервера
    async fetchAllStartDays(): Promise<StartDayType[]> {
        try {
            const response = await axios.get<StartDayType[]>(this.API_URL);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch start days:', error);
            throw error;
        }
    }

    // Получить конкретную запись начала дня с сервера
    async getStartDay(id: string): Promise<StartDayType | null> {
        try {
            const response = await axios.get<StartDayType>(`${this.API_URL}${id}/`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error(`Failed to get start day ${id}:`, error);
            throw error;
        }
    }

    // Создать новую запись начала дня на сервере
    async createStartDay(startDay: StartDayType): Promise<StartDayType> {
        try {
            const { id, created_at, is_synced, is_deleted, ...data } = startDay;
            const response = await axios.post<StartDayType>(this.API_URL, data);
            return response.data;
        } catch (error) {
            console.error('Failed to create start day:', error);
            throw error;
        }
    }

    // Обновить существующую запись начала дня на сервере
    async updateStartDay(startDay: StartDayType): Promise<StartDayType> {
        try {
            const { id, is_synced, is_deleted, ...data } = startDay;
            const response = await axios.put<StartDayType>(`${this.API_URL}${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Failed to update start day ${startDay.id}:`, error);
            throw error;
        }
    }

    // Удалить запись начала дня на сервере
    async deleteStartDay(id: string): Promise<void> {
        try {
            await axios.delete(`${this.API_URL}${id}/`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return; // Если запись не найдена на сервере, считаем удаление успешным
            }
            console.error(`Failed to delete start day ${id}:`, error);
            throw error;
        }
    }
}
