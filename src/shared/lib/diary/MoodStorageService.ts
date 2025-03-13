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

    async getMoodCheckinsByDays(days: number): Promise<MoodCheckin[]> {
        try {
            const checkins = await this.getMoodCheckins();
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today

            const cutoffDate = new Date(today);
            cutoffDate.setDate(today.getDate() - days);
            cutoffDate.setHours(0, 0, 0, 0); // Start of cutoff day

            const filteredCheckins = checkins.filter(checkin => {
                const checkinDate = new Date(checkin.created_at);
                return checkinDate >= cutoffDate && checkinDate <= today;
            });

            console.log(
                `MoodStorageService.getMoodCheckinsByDays: Found ${filteredCheckins.length} entries for last ${days} days`
            );
            return filteredCheckins;
        } catch (error) {
            console.error('Error in getMoodCheckinsByDays:', error);
            return [];
        }
    }

    async getMoodCheckinsByDaysRange(startDays: number, endDays: number): Promise<MoodCheckin[]> {
        try {
            const checkins = await this.getMoodCheckins();
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today

            const startDate = new Date(today);
            startDate.setDate(today.getDate() - endDays);
            startDate.setHours(0, 0, 0, 0); // Start of start day

            const endDate = new Date(today);
            endDate.setDate(today.getDate() - startDays);
            endDate.setHours(23, 59, 59, 999); // End of end day

            const filteredCheckins = checkins.filter(checkin => {
                const checkinDate = new Date(checkin.created_at);
                return checkinDate >= startDate && checkinDate <= endDate;
            });

            console.log(
                `MoodStorageService.getMoodCheckinsByDaysRange: Found ${filteredCheckins.length} entries between ${startDays} and ${endDays} days ago`
            );
            return filteredCheckins;
        } catch (error) {
            console.error('Error in getMoodCheckinsByDaysRange:', error);
            return [];
        }
    }

    async createMoodCheckin(data: Omit<MoodCheckin, 'id' | 'created_at'>): Promise<MoodCheckin> {
        try {
            console.log('MoodStorageService.createMoodCheckin: Начало сохранения данных:', data);

            // Проверка данных перед сохранением
            if (data.mood_level === undefined || data.mood_level === null) {
                throw new Error('MoodStorageService: mood_level не может быть пустым');
            }

            // Гарантируем, что emotions и factors являются массивами
            const emotions = Array.isArray(data.emotions) ? data.emotions : [];
            const factors = Array.isArray(data.factors) ? data.factors : [];

            if (emotions.length === 0) {
                throw new Error('MoodStorageService: emotions не может быть пустым массивом');
            }

            // Получаем текущие записи
            let checkins = await this.getMoodCheckins();

            // Дополнительная проверка, что checkins - это массив
            if (!Array.isArray(checkins)) {
                console.warn('MoodStorageService: checkins не является массивом, создаем новый массив');
                checkins = [];
            }

            // Создаем новую запись с проверенными данными
            const newCheckin: MoodCheckin = {
                id: Date.now(),
                created_at: new Date().toISOString(),
                ...data,
                emotions: emotions,
                factors: factors,
            };

            console.log('MoodStorageService.createMoodCheckin: Создан новый объект для сохранения:', newCheckin);

            checkins.unshift(newCheckin);
            await storage.set(MOOD_STORAGE_KEY, checkins);
            console.log('MoodStorageService.createMoodCheckin: Данные успешно сохранены в хранилище');

            // Сохраняем изменение для последующей синхронизации
            await this.savePendingChange({
                type: 'create',
                data: newCheckin,
                timestamp: Date.now(),
            });
            console.log('MoodStorageService.createMoodCheckin: Изменение добавлено в очередь для синхронизации');

            return newCheckin;
        } catch (error) {
            console.error('MoodStorageService.createMoodCheckin: Ошибка при сохранении данных:', error);

            // Более подробное логирование ошибки
            if (error instanceof Error) {
                console.error('MoodStorageService.createMoodCheckin: Сообщение ошибки:', error.message);
                console.error('MoodStorageService.createMoodCheckin: Стек ошибки:', error.stack);
            }

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
