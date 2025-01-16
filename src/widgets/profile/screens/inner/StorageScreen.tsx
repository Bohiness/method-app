import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { storage } from '@shared/lib/storage/storage.service'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Separator } from '@shared/ui/separator'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { ScreenType } from '@widgets/profile/SettingModal'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, ScrollView } from 'react-native'

interface StorageInfo {
    totalSize: number
    items: {
        key: string
        size: number
    }[]
}

export const StorageScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Получение информации о хранилище
    const getStorageInfo = useCallback(async () => {
        try {
            setIsLoading(true)
            const keys = await storage.getAllKeys()
            let totalSize = 0
            const items = []

            for (const key of keys) {
                const value = await storage.get(key)
                const size = new Blob([JSON.stringify(value)]).size
                totalSize += size
                items.push({ key, size })
            }

            setStorageInfo({ totalSize, items })
        } catch (error) {
            console.error('Error getting storage info:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Очистка кэша
    const clearCache = useCallback(async () => {
        Alert.alert(
            t('settings.storage.clearCache.title'),
            t('settings.storage.clearCache.message'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true)
                            await storage.clear()
                            await getStorageInfo()
                        } catch (error) {
                            console.error('Error clearing cache:', error)
                        } finally {
                            setIsLoading(false)
                        }
                    }
                }
            ]
        )
    }, [t, getStorageInfo])

    // Удаление конкретного элемента
    const removeItem = useCallback(async (key: string) => {
        try {
            await storage.remove(key)
            await getStorageInfo()
        } catch (error) {
            console.error('Error removing item:', error)
        }
    }, [getStorageInfo])

    useEffect(() => {
        getStorageInfo()
    }, [getStorageInfo])

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('settings.storage.title')} />

            <ScrollView className="flex-1 px-4">
                {/* Общая информация */}
                <View className="mt-4 p-4 rounded-lg" variant='paper'>
                    <Text variant="secondary" size="sm">
                        {t('settings.storage.totalUsed')}
                    </Text>
                    <Text size="xl" weight="bold" className="mt-1" variant='secondary'>
                        {storageInfo ? formatSize(storageInfo.totalSize) : '...'}
                    </Text>
                </View>

                {/* Действия */}
                <View className="mt-4">
                    <Button
                        variant="destructive"
                        leftIcon="Trash2"
                        onPress={clearCache}
                        loading={isLoading}
                    >
                        {t('settings.storage.clearCache.button')}
                    </Button>
                </View>

                {/* Список элементов */}
                <View className="mt-6">
                    <Text weight="medium" className="mb-2" variant="secondary">
                        {t('settings.storage.items.title')}
                    </Text>

                    {storageInfo?.items.map((item, index) => (
                        <View key={item.key}>
                            {index > 0 && <Separator />}
                            <View className="flex-row items-center justify-between py-4">
                                <View className="flex-1">
                                    <Text numberOfLines={1} className="flex-1">
                                        {item.key}
                                    </Text>
                                    <Text variant="secondary" size="sm">
                                        {formatSize(item.size)}
                                    </Text>
                                </View>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onPress={() => removeItem(item.key)}
                                >
                                    <Icon name="Trash2" size={20} />
                                </Button>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}