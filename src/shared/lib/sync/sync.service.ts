// src/shared/lib/sync/sync.service.ts
import { apiClient } from '@shared/config/api-client'
import { storage } from '@shared/lib/storage/storage.service'
import { MoodCheckin } from '@shared/types/diary/mood/MoodType'
import { QueryClient } from '@tanstack/react-query'

class SyncService {
    // Вместо хука внедряем QueryClient через метод
    async syncMoodCheckins(queryClient: QueryClient) {
        try {
            const offlineData = await storage.get<MoodCheckin[]>('offline_mood-checkins') || [];
            
            if (offlineData.length === 0) return;

            // Отправляем каждую запись
            for (const checkin of offlineData) {
                try {
                    await apiClient.post('/api/mood-checkins/', checkin);
                } catch (error) {
                    console.error('Failed to sync mood checkin:', error);
                }
            }

            // Очищаем синхронизированные данные
            await storage.remove('offline_mood-checkins');
            
            // Обновляем кэш React Query
            queryClient.invalidateQueries({ queryKey: ['mood-checkins'] });
        } catch (error) {
            console.error('Mood checkins sync failed:', error);
        }
    }
}

export const syncService = new SyncService();