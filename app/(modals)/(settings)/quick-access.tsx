import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { useAppSettings } from '@shared/context/app-settings-context'
import { CombinedAppActivity, useAppActivities } from '@shared/hooks/systems/useAppActivity'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Checkbox } from '@shared/ui/checkbox'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList } from 'react-native'

export default function QuickAccessSettingsScreen() {
    const { t } = useTranslation()
    const activities = useAppActivities()
    const { quickAccess } = useAppSettings()
    const {
        options: quickAccessOptions,
        isLoading: isLoadingOptions,
        addOption,
        removeOption,
    } = quickAccess

    // Создаем Set из ID текущих опций для быстрой проверки (O(1))
    const quickAccessIds = new Set(quickAccessOptions.map(opt => opt.id))

    const handleToggleSwitch = (activity: CombinedAppActivity, isActive: boolean) => {
        if (isActive) {
            addOption({ id: activity.id, icon: activity.icon, titleKey: activity.titleKey, key: activity.key })
        } else {
            removeOption(activity.key)
        }
    }

    const renderItem = ({ item }: { item: CombinedAppActivity }) => {
        const isInQuickAccess = quickAccessIds.has(item.id)
        return (
            <HapticTab onPress={() => handleToggleSwitch(item, !isInQuickAccess)}>

                <View className="flex-row items-center justify-between py-3 px-4 border-b border-border dark:border-border-dark">
                    <View className="flex-row items-center flex-1 gap-x-4">
                        <Icon name={item.icon} size={24} variant="secondary" className="mr-3" />
                        <View className="flex-1">
                            <Text className="flex-1">{t(item.titleKey)}</Text>
                            {item.descriptionKey && <Text variant="secondary" size="sm" className="flex-1">{t(item.descriptionKey)}</Text>}
                        </View>
                    </View>
                    <Checkbox
                        checked={isInQuickAccess}
                        onChange={(value) => handleToggleSwitch(item, value)}
                    />
                </View>
            </HapticTab>
        )
    }

    return (
        <ModalBottomScreenContent title={t('settings.quickAccess.title')} description={t('settings.quickAccess.description')}>

            {isLoadingOptions ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                </View>
            ) : (
                <FlatList
                    data={Object.values(activities)}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                // Можно добавить ListEmptyComponent, если allActivities пуст
                />
            )}
        </ModalBottomScreenContent>
    )
}   