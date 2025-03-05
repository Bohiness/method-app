import { EveningReflectionType } from '@shared/types/diary/eveningreflection/EveningReflectionType';
import { storage } from '../storage/storage.service';

export class EveningReflectionStorageService {
    private readonly STORAGE_KEY = 'evening-reflections';

    // Функция для генерации простого ID без использования crypto
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
    }

    // Получить все рефлексии
    async getEveningReflections(): Promise<EveningReflectionType[]> {
        try {
            const storedData = await storage.get<EveningReflectionType[]>(this.STORAGE_KEY);
            if (!storedData) return [];

            const reflections: EveningReflectionType[] = storedData;
            // Возвращаем только не удаленные записи
            return reflections.filter(reflection => !reflection.is_deleted);
        } catch (error) {
            console.error('Error getting evening reflections:', error);
            return [];
        }
    }

    // Получить рефлексию по ID
    async getEveningReflectionById(id: string): Promise<EveningReflectionType | null> {
        try {
            const reflections = await this.getEveningReflections();
            const reflection = reflections.find(r => r.id === id && !r.is_deleted);
            return reflection || null;
        } catch (error) {
            console.error(`Error getting evening reflection with id ${id}:`, error);
            return null;
        }
    }

    // Создать новую рефлексию
    async createEveningReflection(
        data: Omit<EveningReflectionType, 'id' | 'created_at'>
    ): Promise<EveningReflectionType> {
        try {
            const reflections = await this.getEveningReflections();

            const newReflection: EveningReflectionType = {
                ...data,
                id: this.generateId(),
                created_at: new Date().toISOString(),
                is_synced: false,
            };

            reflections.push(newReflection);
            await storage.set(this.STORAGE_KEY, JSON.stringify(reflections));

            return newReflection;
        } catch (error) {
            console.error('Error creating evening reflection:', error);
            throw new Error('Failed to create evening reflection');
        }
    }

    // Обновить существующую рефлексию
    async updateEveningReflection(id: string, data: Partial<EveningReflectionType>): Promise<EveningReflectionType> {
        try {
            const reflections = await this.getEveningReflections();
            const index = reflections.findIndex(r => r.id === id);

            if (index === -1) {
                throw new Error(`Evening reflection with id ${id} not found`);
            }

            const updatedReflection = {
                ...reflections[index],
                ...data,
                is_synced: false,
            };

            reflections[index] = updatedReflection;
            await storage.set(this.STORAGE_KEY, JSON.stringify(reflections));

            return updatedReflection;
        } catch (error) {
            console.error(`Error updating evening reflection with id ${id}:`, error);
            throw error;
        }
    }

    // Удалить рефлексию (мягкое удаление)
    async deleteEveningReflection(id: string): Promise<void> {
        try {
            const reflections = await this.getEveningReflections();
            const index = reflections.findIndex(r => r.id === id);

            if (index === -1) {
                throw new Error(`Evening reflection with id ${id} not found`);
            }

            reflections[index] = {
                ...reflections[index],
                is_deleted: true,
                is_synced: false,
            };

            await storage.set(this.STORAGE_KEY, JSON.stringify(reflections));
        } catch (error) {
            console.error(`Error deleting evening reflection with id ${id}:`, error);
            throw error;
        }
    }

    // Получить все рефлексии, включая удаленные, для синхронизации
    async getAllEveningReflectionsForSync(): Promise<EveningReflectionType[]> {
        try {
            const storedData = await storage.get<EveningReflectionType[]>(this.STORAGE_KEY);
            if (!storedData) return [];

            const reflections: EveningReflectionType[] = storedData;
            return reflections.filter(reflection => !reflection.is_synced);
        } catch (error) {
            console.error('Error getting evening reflections for sync:', error);
            return [];
        }
    }

    // Отметить рефлексии как синхронизированные
    async markAsSynced(ids: string[]): Promise<void> {
        try {
            const storedData = await storage.get<EveningReflectionType[]>(this.STORAGE_KEY);
            if (!storedData) return;

            const reflections: EveningReflectionType[] = storedData;

            const updatedReflections = reflections.map(reflection => {
                if (ids.includes(reflection.id)) {
                    return { ...reflection, is_synced: true };
                }
                return reflection;
            });

            await storage.set(this.STORAGE_KEY, JSON.stringify(updatedReflections));
        } catch (error) {
            console.error('Error marking evening reflections as synced:', error);
            throw error;
        }
    }
}
