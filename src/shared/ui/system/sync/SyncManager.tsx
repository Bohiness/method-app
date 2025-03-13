import { useNetwork } from '@shared/hooks/systems/network/useNetwork'
import { syncService } from '@shared/lib/sync/sync.service'
import { plansSyncService } from '@shared/sync/plans-sync.service'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export const SyncManager = () => {
    const { isOnline } = useNetwork()
    const queryClient = useQueryClient()

    useEffect(() => {
        if (isOnline) {
            syncOfflineData()
        }
    }, [isOnline])

    const syncOfflineData = async () => {
        try {
            // Передаем queryClient в метод синхронизации
            await syncService.syncMoodCheckins(queryClient)
            await syncService.syncFavorites(queryClient)
            await plansSyncService.syncTasks(queryClient)

            // В будущем добавьте другие типы данных
            // await syncService.syncUserProfile();
            // await syncService.syncSettings();
            // и т.д.
        } catch (error) {
            console.error('Sync failed:', error)
        }
    }

    return null
}