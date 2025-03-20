import { storage } from '@shared/lib/storage/storage.service';
import { MoodCheckin } from '@shared/types/diary/mood/MoodType';
import { logger } from '../logger/logger.service';

const MOOD_STORAGE_KEY = 'mood-checkins';
const PENDING_CHANGES_KEY = 'mood-checkins-pending-changes';

// Сервис для работы с локальным хранилищем
export class MoodStorageService {
    async getMoodCheckins(): Promise<MoodCheckin[]> {
        try {
            const checkins = await storage.get<MoodCheckin[]>(MOOD_STORAGE_KEY);
            return checkins || [];
        } catch (error) {
            logger.error(error, 'Failed to get mood checkins from storage:');
            return [];
        }
    }

    async getMoodCheckinsByDays(days: number): Promise<MoodCheckin[]> {
        try {
            const checkins = await this.getMoodCheckins();
            const now = new Date();

            // Начало периода (days дней назад)
            const cutoffDate = new Date(now);
            cutoffDate.setDate(now.getDate() - days);
            cutoffDate.setHours(0, 0, 0, 0);

            const filteredCheckins = checkins.filter(checkin => {
                const checkinDate = new Date(checkin.created_at);
                return checkinDate >= cutoffDate;
            });

            logger.log(
                ` Найдено ${filteredCheckins.length} записей за последние ${days} дней`,
                'MoodStorageService.getMoodCheckinsByDays'
            );
            return filteredCheckins;
        } catch (error) {
            logger.error(error, 'Error in getMoodCheckinsByDays:');
            return [];
        }
    }

    async getMoodCheckinsByDaysRange(startDays: number, endDays: number): Promise<MoodCheckin[]> {
        try {
            const checkins = await this.getMoodCheckins();
            const now = new Date();

            // Начало периода (более старые записи)
            const startDate = new Date(now);
            startDate.setDate(now.getDate() - endDays);
            startDate.setHours(0, 0, 0, 0);

            // Конец периода (более новые записи)
            const endDate = new Date(now);
            endDate.setDate(now.getDate() - startDays);
            endDate.setHours(0, 0, 0, 0);

            const filteredCheckins = checkins.filter(checkin => {
                const checkinDate = new Date(checkin.created_at);
                // Включаем записи строго между startDate (включительно) и endDate (исключительно)
                return checkinDate >= startDate && checkinDate < endDate;
            });

            logger.log(
                `MoodStorageService.getMoodCheckinsByDaysRange: Found ${filteredCheckins.length} entries строго между ${startDays} и ${endDays} днями назад`
            );
            return filteredCheckins;
        } catch (error) {
            logger.error(error, 'Error in getMoodCheckinsByDaysRange:');
            return [];
        }
    }

    async createMoodCheckin(data: Omit<MoodCheckin, 'id' | 'created_at'>): Promise<MoodCheckin> {
        try {
            logger.log(data, 'MoodStorageService.createMoodCheckin: Начало сохранения данных:');

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
                logger.warn('MoodStorageService: checkins не является массивом, создаем новый массив');
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

            logger.log(newCheckin, 'MoodStorageService.createMoodCheckin: Создан новый объект для сохранения:');

            checkins.unshift(newCheckin);
            await storage.set(MOOD_STORAGE_KEY, checkins);
            logger.log('MoodStorageService.createMoodCheckin: Данные успешно сохранены в хранилище');

            // Сохраняем изменение для последующей синхронизации
            await this.savePendingChange({
                type: 'create',
                data: newCheckin,
                timestamp: Date.now(),
            });
            logger.log('MoodStorageService.createMoodCheckin: Изменение добавлено в очередь для синхронизации');

            return newCheckin;
        } catch (error) {
            logger.error(error, 'MoodStorageService.createMoodCheckin: Ошибка при сохранении данных:');

            // Более подробное логирование ошибки
            if (error instanceof Error) {
                logger.error(error.message, 'MoodStorageService.createMoodCheckin: Сообщение ошибки:');
                logger.error(error.stack, 'MoodStorageService.createMoodCheckin: Стек ошибки:');
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
            logger.error(error, 'Failed to save pending change:');
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
