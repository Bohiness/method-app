import { apiClient } from '@shared/config/api-client'
import { MoodStorageService } from '@shared/lib/diary/MoodStorageService'
import { MoodCheckin } from '@shared/types/diary/mood/MoodType'

// Сервис для синхронизации
export class MoodSyncService {
    constructor(private storage: MoodStorageService) { }

    async syncChanges(): Promise<void> {
        try {
            const pendingChanges = await this.storage.getPendingChanges()

            for (const change of pendingChanges) {
                if (change.type === 'create') {
                    await apiClient.post<MoodCheckin>('/api/mood-checkins/', change.data)
                }
            }

            // Получаем актуальные данные с сервера
            const serverCheckins = await apiClient.get<MoodCheckin[]>('/api/mood-checkins/')
            await this.storage.updateMoodCheckins(serverCheckins)
            await this.storage.clearPendingChanges()
        } catch (error) {
            console.error('Failed to sync mood checkins:', error)
            throw error
        }
    }

    startPeriodicSync(intervalMs: number = 60000): () => void {
        const interval = setInterval(async () => {
            try {
                await this.syncChanges()
            } catch (error) {
                console.error('Periodic sync failed:', error)
            }
        }, intervalMs)

        return () => clearInterval(interval)
    }
}