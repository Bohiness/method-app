import { storage } from '@shared/lib/storage/storage.service';
import { MoodCheckin } from '@shared/types/diary/mood/MoodType';

const MOOD_STORAGE_KEY = 'mood-checkins';
const PENDING_CHANGES_KEY = 'mood-checkins-pending-changes';

// Сервис для работы с локальным хранилищем
export class MoodStorageService {
    async getMoodCheckins(): Promise<MoodCheckin[]> {
        try {
            const checkins = await storage.get<MoodCheckin[]>(MOOD_STORAGE_KEY);
            return checkins || [];
        } catch (error) {
            console.error('Failed to get mood checkins from storage:', error);
            return [];
        }
    }

    async createMoodCheckin(data: Omit<MoodCheckin, 'id' | 'created_at'>): Promise<MoodCheckin> {
        try {
            const checkins = await this.getMoodCheckins();
            const newCheckin: MoodCheckin = {
                id: Date.now(),
                created_at: new Date().toISOString(),
                ...data,
            };

            checkins.unshift(newCheckin);
            await storage.set(MOOD_STORAGE_KEY, checkins);

            // Сохраняем изменение для последующей синхронизации
            await this.savePendingChange({
                type: 'create',
                data: newCheckin,
                timestamp: Date.now(),
            });

            return newCheckin;
        } catch (error) {
            console.error('Failed to create mood checkin in storage:', error);
            throw error;
        }
    }

    private async savePendingChange(change: any): Promise<void> {
        try {
            const changes = (await storage.get<any[]>(PENDING_CHANGES_KEY)) || [];
            changes.push(change);
            await storage.set(PENDING_CHANGES_KEY, changes);
        } catch (error) {
            console.error('Failed to save pending change:', error);
            throw error;
        }
    }

    async getPendingChanges(): Promise<any[]> {
        return (await storage.get<any[]>(PENDING_CHANGES_KEY)) || [];
    }

    async clearPendingChanges(): Promise<void> {
        await storage.remove(PENDING_CHANGES_KEY);
    }

    async updateMoodCheckins(serverCheckins: MoodCheckin[]): Promise<void> {
        await storage.set(MOOD_STORAGE_KEY, serverCheckins);
    }
}
