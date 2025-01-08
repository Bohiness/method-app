import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useLanguage } from '@shared/context/language-provider'
import { MenuGroup, MenuItem } from '@shared/ui/modals/menu-item'
import { Text } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { ScreenType } from '../SettingModal'

export const SettingsScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()

    return (
        <View>
            <HeaderMenuItem onBack={onBack} title={'settings.title'} />
            <View className="p-4">
                <MenuItem
                    label={t('settings.notifications.title')}
                    leftIcon={'Bell'}
                    isFirst
                    isLast
                    showSeparator
                    onPress={() => {
                        onNavigate('notifications')
                    }}
                />

                {/* Группа элементов */}
                <MenuGroup label={t('settings.preferences.title')} className="mt-6">
                    <MenuItem
                        label={t('settings.theme.title')}
                        leftIcon={'Moon'}
                        onPress={() => {
                            onNavigate('theme')
                        }}
                    />

                    <MenuItem
                        label={t('settings.language.title')}
                        rightContent={
                            <Text variant="secondary">
                                {currentLanguage.toUpperCase()}
                            </Text>
                        }
                        onPress={() => {
                            onNavigate('language')
                        }}
                    />
                </MenuGroup>
            </View>
        </View>
    )
}