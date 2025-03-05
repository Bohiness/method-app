import { apiClient } from '@shared/config/api-client'
import { MoodStorageService } from '@shared/lib/diary/MoodStorageService'
import { MoodCheckin } from '@shared/types/diary/mood/MoodType'

// Сервис для синхронизации
export class MoodSyncService {
    constructor(private storage: MoodStorageService) { }

    async syncChanges(): Promise<void> {
        try {
            console.log('MoodSyncService.syncChanges: Начало синхронизации')
            const pendingChanges = await this.storage.getPendingChanges()
            console.log('MoodSyncService.syncChanges: Получены ожидающие изменения:', pendingChanges.length)

            for (const change of pendingChanges) {
                try {
                    if (change.type === 'create') {
                        console.log('MoodSyncService.syncChanges: Отправка нового чекина на сервер:', change.data)
                        await apiClient.post<MoodCheckin>('/api/mood-checkins/', change.data)
                        console.log('MoodSyncService.syncChanges: Чекин успешно отправлен на сервер')
                    }
                } catch (changeError) {
                    console.error('MoodSyncService.syncChanges: Ошибка при обработке изменения:', changeError)
                    // Продолжаем обработку других изменений
                }
            }

            // Получаем актуальные данные с сервера
            console.log('MoodSyncService.syncChanges: Запрос актуальных данных с сервера')
            try {
                // Обрабатываем пагинированный ответ
                const response = await apiClient.get<{
                    count: number
                    next: string | null
                    previous: string | null
                    results: MoodCheckin[]
                }>('/api/mood-checkins/')

                // Извлекаем массив результатов из пагинированного ответа
                const serverCheckins = response.results || []
                console.log('MoodSyncService.syncChanges: Получены данные с сервера:', serverCheckins.length)
                await this.storage.updateMoodCheckins(serverCheckins)
                console.log('MoodSyncService.syncChanges: Локальное хранилище обновлено')
            } catch (serverError) {
                console.error('MoodSyncService.syncChanges: Ошибка при получении данных с сервера:', serverError)
                // Не очищаем ожидающие изменения, если не удалось получить данные с сервера
                return
            }

            await this.storage.clearPendingChanges()
            console.log('MoodSyncService.syncChanges: Очередь ожидающих изменений очищена')
            console.log('MoodSyncService.syncChanges: Синхронизация успешно завершена')
        } catch (error) {
            console.error('MoodSyncService.syncChanges: Ошибка при синхронизации:', error)

            // Более подробное логирование ошибки
            if (error instanceof Error) {
                console.error('MoodSyncService.syncChanges: Сообщение ошибки:', error.message)
                console.error('MoodSyncService.syncChanges: Стек ошибки:', error.stack)
            }

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