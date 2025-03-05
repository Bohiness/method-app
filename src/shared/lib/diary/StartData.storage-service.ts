import { StartDayType } from '@shared/types/diary/startday/StartDayType';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage/storage.service';

export class StartDayStorageService {
    private readonly STORAGE_KEY = 'start_day';

    // Получить все записи начала дня
    async getStartDays(): Promise<StartDayType[]> {
        try {
            const storedData = await storage.get<StartDayType[]>(this.STORAGE_KEY);
            if (!storedData) return [];

            const startDays: StartDayType[] = storedData;
            // Возвращаем только не удаленные записи
            return startDays.filter(startDay => !startDay.is_deleted);
        } catch (error) {
            console.error('Error getting start days:', error);
            return [];
        }
    }

    // Получить запись начала дня по ID
    async getStartDayById(id: string): Promise<StartDayType | null> {
        try {
            const startDays = await this.getStartDays();
            const startDay = startDays.find(sd => sd.id === id && !sd.is_deleted);
            return startDay || null;
        } catch (error) {
            console.error(`Error getting start day with id ${id}:`, error);
            return null;
        }
    }

    // Создать новую запись начала дня
    async createStartDay(data: Omit<StartDayType, 'id' | 'created_at'>): Promise<StartDayType> {
        try {
            const startDays = await this.getStartDays();

            const newStartDay: StartDayType = {
                ...data,
                id: uuidv4(),
                created_at: new Date().toISOString(),
                is_synced: false,
            };

            startDays.push(newStartDay);
            await storage.set(this.STORAGE_KEY, JSON.stringify(startDays));

            return newStartDay;
        } catch (error) {
            console.error('Error creating start day:', error);
            throw new Error('Failed to create start day');
        }
    }

    // Обновить существующую запись начала дня
    async updateStartDay(id: string, data: Partial<StartDayType>): Promise<StartDayType> {
        try {
            const startDays = await this.getStartDays();
            const index = startDays.findIndex(sd => sd.id === id);

            if (index === -1) {
                throw new Error(`Start day with id ${id} not found`);
            }

            const updatedStartDay = {
                ...startDays[index],
                ...data,
                is_synced: false,
            };

            startDays[index] = updatedStartDay;
            await storage.set(this.STORAGE_KEY, JSON.stringify(startDays));

            return updatedStartDay;
        } catch (error) {
            console.error(`Error updating start day with id ${id}:`, error);
            throw error;
        }
    }

    // Удалить запись начала дня (мягкое удаление)
    async deleteStartDay(id: string): Promise<void> {
        try {
            const startDays = await this.getStartDays();
            const index = startDays.findIndex(sd => sd.id === id);

            if (index === -1) {
                throw new Error(`Start day with id ${id} not found`);
            }

            startDays[index] = {
                ...startDays[index],
                is_deleted: true,
                is_synced: false,
            };

            await storage.set(this.STORAGE_KEY, JSON.stringify(startDays));
        } catch (error) {
            console.error(`Error deleting start day with id ${id}:`, error);
            throw error;
        }
    }

    // Получить все записи начала дня, включая удаленные, для синхронизации
    async getAllStartDaysForSync(): Promise<StartDayType[]> {
        try {
            const storedData = await storage.get<StartDayType[]>(this.STORAGE_KEY);
            if (!storedData) return [];

            const startDays: StartDayType[] = storedData;
            return startDays.filter(startDay => !startDay.is_synced);
        } catch (error) {
            console.error('Error getting start days for sync:', error);
            return [];
        }
    }

    // Отметить записи начала дня как синхронизированные
    async markAsSynced(ids: string[]): Promise<void> {
        try {
            const storedData = await storage.get<StartDayType[]>(this.STORAGE_KEY);
            if (!storedData) return;

            const startDays: StartDayType[] = storedData;

            const updatedStartDays = startDays.map(startDay => {
                if (ids.includes(startDay.id)) {
                    return { ...startDay, is_synced: true };
                }
                return startDay;
            });

            await storage.set(this.STORAGE_KEY, JSON.stringify(updatedStartDays));
        } catch (error) {
            console.error('Error marking start days as synced:', error);
            throw error;
        }
    }
}
