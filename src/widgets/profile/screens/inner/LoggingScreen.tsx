import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { LogViewer } from '@shared/ui/debug/LogViewer'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'


export const LoggingScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()

    return (
        <View className="flex-1">
            <HeaderMenuItem
                onBack={onBack}
                title={t('settings.notifications.title')}
            />
            <LogViewer />
        </View>
    )
}