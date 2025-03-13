import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { storage } from '@shared/lib/storage/storage.service'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Separator } from '@shared/ui/separator'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, TouchableOpacity } from 'react-native'
interface StorageInfo {
    totalSize: number
    items: Array<{
        key: string
        size: number
        value: string
    }>
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
    const [isLoading, setIsLoading] = useState(true)

    // Загрузка информации о хранилище
    const loadStorageInfo = useCallback(async () => {
        try {
            setIsLoading(true)
            const info = await storage.getStorageSize()
            setStorageInfo(info)
        } catch (error) {
            console.error('Error loading storage info:', error)
            Alert.alert(
                t('common.error'),
                t('settings.storage.errorLoading')
            )
        } finally {
            setIsLoading(false)
        }
    }, [t])

    // Открытие модального окна с детальной информацией
    const openValueDetails = (item: StorageInfo['items'][0]) => {
        router.push({
            pathname: '/(modals)/(profile)/inner/storage-item',
            params: {
                item: JSON.stringify(item)
            }
        })
    }

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
                            await loadStorageInfo()
                        } catch (error) {
                            console.error('Error clearing cache:', error)
                            Alert.alert(
                                t('common.error'),
                                t('settings.storage.errorClearing')
                            )
                        } finally {
                            setIsLoading(false)
                        }
                    }
                }
            ]
        )
    }, [t, loadStorageInfo])

    // Удаление конкретного элемента
    const removeItem = useCallback(async (key: string) => {
        try {
            setIsLoading(true)
            await storage.remove(key)
            await loadStorageInfo()
        } catch (error) {
            console.error('Error removing item:', error)
            Alert.alert(
                t('common.error'),
                t('settings.storage.errorRemoving')
            )
        } finally {
            setIsLoading(false)
        }
    }, [loadStorageInfo, t])

    useEffect(() => {
        loadStorageInfo()
    }, [loadStorageInfo])

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('settings.storage.title')} />

            {/* Общая информация */}
            <View className="mt-4 p-4 rounded-lg" variant='paper'>
                <Text variant="secondary" size="sm">
                    {t('settings.storage.totalUsed')}
                </Text>
                <Text size="xl" weight="bold" className="mt-1" variant='secondary'>
                    {isLoading ? '...' : storageInfo ? formatSize(storageInfo.totalSize) : '0 B'}
                </Text>
            </View>

            {/* Действия */}
            <View className="mt-4">
                <Button
                    variant="destructive"
                    leftIcon="Trash2"
                    onPress={clearCache}
                    loading={isLoading}
                    disabled={!storageInfo?.totalSize}
                >
                    {t('settings.storage.clearCache.button')}
                </Button>
            </View>

            {/* Список элементов */}
            <View className="mt-6">
                <Text weight="medium" className="mb-2" variant="secondary">
                    {t('settings.storage.items.title')}
                </Text>

                {!isLoading && storageInfo?.items.length === 0 && (
                    <Text variant="secondary" className="text-center py-4">
                        {t('settings.storage.noItems')}
                    </Text>
                )}

                {storageInfo?.items.map((item, index) => (
                    <View key={item.key}>
                        {index > 0 && <Separator />}
                        <TouchableOpacity
                            onPress={() => openValueDetails(item)}
                            className="py-4"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text numberOfLines={1} className="flex-1">
                                        {item.key}
                                    </Text>
                                    <Text variant="secondary" size="sm">
                                        {formatSize(item.size)}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onPress={(e) => {
                                            e.stopPropagation()
                                            removeItem(item.key)
                                        }}
                                        disabled={isLoading}
                                    >
                                        <Icon name="Trash2" size={20} />
                                    </Button>
                                    <Icon name="ChevronRight" size={20} variant="secondary" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    )
}