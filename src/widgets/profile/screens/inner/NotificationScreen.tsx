// src/widgets/profile/screens/NotificationSettingsScreen.tsx
import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { DailyNotificationsSettings } from '@features/notifications/DailyNotificationsSettings'
import { useNotification } from '@shared/context/notification-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { Switch, SwitchGroup } from '@shared/ui/switch'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'

export const NotificationSettingsScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()
    const {
        settings,
        updateSettings,
        categories,
        updateCategoryPreference
    } = useNotification()

    const [loading, setLoading] = useState(false)

    // Состояния для разных типов уведомлений
    const [systemPreferences, setSystemPreferences] = useState({
        push_enabled: settings?.push_enabled ?? true,
        email_enabled: settings?.email_enabled ?? true,
        sound_enabled: settings?.sound_enabled ?? true,
        vibration_enabled: settings?.vibration_enabled ?? true,
    })

    // Обработчик изменения системных настроек
    const handleSystemPreferenceChange = async (key: string, value: boolean) => {
        setLoading(true)
        try {
            const updatedPreferences = {
                ...systemPreferences,
                [key]: value
            }
            setSystemPreferences(updatedPreferences)
            await updateSettings(updatedPreferences)
        } catch (error) {
            console.error('Ошибка обновления настроек:', error)
        } finally {
            setLoading(false)
        }
    }

    // Обработчик изменения категорий уведомлений
    const handleCategoryChange = async (categoryId: string, enabled: boolean) => {
        setLoading(true)
        try {
            await updateCategoryPreference(categoryId, enabled)
        } catch (error) {
            console.error('Ошибка обновления категории:', error)
        } finally {
            setLoading(false)
        }
    }


    return (
        <ScrollView style={{ flex: 1 }}>
            <View className="flex-1">
                <HeaderMenuItem
                    onBack={onBack}
                    title={t('settings.notifications.title')}
                />

                <View className="px-4">
                    {/* Системные настройки */}
                    <SwitchGroup
                        label={t('settings.notifications.system')}
                        className="mb-8"
                        values={Object.entries(systemPreferences)
                            .filter(([_, value]) => value)
                            .map(([key]) => key)}
                        onChange={(values) => {
                            const newPreferences = { ...systemPreferences };
                            (Object.keys(systemPreferences) as Array<keyof typeof systemPreferences>).forEach(key => {
                                newPreferences[key] = values.includes(key)
                            })
                            Object.entries(newPreferences).forEach(([key, value]) => {
                                handleSystemPreferenceChange(key, value)
                            })
                        }}
                    >
                        <Switch
                            value="push_enabled"
                            label={t('settings.notifications.push_enabled')}
                            checked={systemPreferences.push_enabled}
                            onChange={(value) => handleSystemPreferenceChange('push_enabled', value)}
                        />
                        <Switch
                            value="email_enabled"
                            label={t('settings.notifications.email_enabled')}
                            checked={systemPreferences.email_enabled}
                            onChange={(value) => handleSystemPreferenceChange('email_enabled', value)}
                        />
                        <Switch
                            value="sound_enabled"
                            label={t('settings.notifications.sound_enabled')}
                            checked={systemPreferences.sound_enabled}
                            onChange={(value) => handleSystemPreferenceChange('sound_enabled', value)}
                        />
                        <Switch
                            value="vibration_enabled"
                            label={t('settings.notifications.vibration_enabled')}
                            checked={systemPreferences.vibration_enabled}
                            onChange={(value) => handleSystemPreferenceChange('vibration_enabled', value)}
                        />
                    </SwitchGroup>

                    {/* Ежедневные уведомления */}
                    <DailyNotificationsSettings />

                    {/* Категории уведомлений */}
                    {categories.length > 0 && (
                        <SwitchGroup
                            label={t('settings.notifications.categories')}
                            className="mb-8"
                            values={categories.filter(c => c.enabled).map(c => c.id)}
                            onChange={(values) => {
                                categories.forEach(category => {
                                    if (values.includes(category.id) !== category.enabled) {
                                        handleCategoryChange(category.id, values.includes(category.id))
                                    }
                                })
                            }}
                        >
                            {categories.map(category => (
                                <Switch
                                    value={category.id}
                                    key={category.id}
                                    label={t(`settings.notifications.categories.${category.name}`)}
                                    checked={category.enabled}
                                    onChange={(value) => handleCategoryChange(category.id, value)}
                                />
                            ))}
                        </SwitchGroup>
                    )}

                    {/* Важность уведомлений */}
                    <View className="mb-8">
                        <Text
                            size="sm"
                            variant="secondary"
                            className="text-center"
                        >
                            {t('settings.notifications.importance_notice')}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}