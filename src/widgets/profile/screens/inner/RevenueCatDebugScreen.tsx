import { RevenueCatDebugPanel } from '@features/components/RevenueCatDebugPanel'
import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const RevenueCatDebugScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()

    return (
        <View>
            <HeaderMenuItem
                onBack={onBack}
                title={t('settings.revenuecat.title')}
            />
            <RevenueCatDebugPanel />
        </View>
    )
}
