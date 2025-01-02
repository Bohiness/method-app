import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { Checkbox, CheckboxGroup } from '@shared/ui/checkbox'
import { ScreenType } from '@widgets/profile/SettingModal'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const NotificationScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {
    const { t } = useTranslation()
    const [pushNotifications, setPushNotifications] = useState<string[]>(['daily-reminder', 'streaks'])
    const [emailNotifications, setEmailNotifications] = useState<string[]>(['weekly-summary'])
    const [inAppNotifications, setInAppNotifications] = useState<string[]>(['achievements'])

    return (
        <View>
            <HeaderMenuItem onBack={onBack} title={'settings.notifications.title'} />

            <CheckboxGroup
                label={t('settings.notifications.push')}
                values={pushNotifications}
                onChange={setPushNotifications}
                className="mb-8"
            >
                <Checkbox
                    label={t('settings.notifications.dailyReminder')}
                    value="daily-reminder"
                />
                <Checkbox
                    label={t('settings.notifications.streaksProgress')}
                    value="streaks"
                />
                <Checkbox
                    label={t('settings.notifications.newFeatures')}
                    value="features"
                />
                <Checkbox
                    label={t('settings.notifications.appUpdates')}
                    value="updates"
                />
            </CheckboxGroup>

            <CheckboxGroup
                label={t('settings.notifications.email')}
                values={emailNotifications}
                onChange={setEmailNotifications}
                className="mb-8"
            >
                <Checkbox
                    label={t('settings.notifications.weeklySummary')}
                    value="weekly-summary"
                />
                <Checkbox
                    label={t('settings.notifications.monthlyReport')}
                    value="monthly-report"
                />
                <Checkbox
                    label={t('settings.notifications.tipsRecommendations')}
                    value="tips"
                />
            </CheckboxGroup>

            <CheckboxGroup
                label={t('settings.notifications.inApp')}
                values={inAppNotifications}
                onChange={setInAppNotifications}
            >
                <Checkbox
                    label={t('settings.notifications.achievementUnlocked')}
                    value="achievements"
                />
                <Checkbox
                    label={t('settings.notifications.communityInteractions')}
                    value="community"
                />
                <Checkbox
                    label={t('settings.notifications.importantAnnouncements')}
                    value="announcements"
                />
            </CheckboxGroup>
        </View>
    )
}