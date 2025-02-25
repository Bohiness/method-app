import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { MenuItem } from '@shared/ui/modals/menu-item'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const PlansSettingScreen = ({ onBack, onNavigate }: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()


    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('settings.plans.title')} />
            <MenuItem
                label={t('settings.myProjects.title')}
                isFirst
                isLast
                showSeparator
                onPress={() => {
                    onNavigate('myProjects')
                }}
            />
        </View>
    )
}