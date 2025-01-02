import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { MenuGroup, MenuItem } from '@shared/ui/modals/menu-item'
import { Text } from '@shared/ui/styled-text'
import { View } from 'react-native'
import { ScreenType } from '../SettingModal'

export const SettingsScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {

    return (
        <View>
            <HeaderMenuItem onBack={onBack} title={'settings.title'} />
            <View className="p-4">
                <MenuItem
                    label="Notifications"
                    leftIcon={'Bell'}
                    isFirst
                    isLast
                    showSeparator
                    onPress={() => {
                        onNavigate('notifications')
                    }}
                />

                {/* Группа элементов */}
                <MenuGroup label="Preferences" className="mt-6">
                    <MenuItem
                        label="Appearance"
                        leftIcon={'Moon'}
                        onPress={() => {
                            onNavigate('theme')
                        }}
                    />

                    <MenuItem
                        label="Language"
                        rightContent={
                            <Text variant="secondary" size="sm">
                                English
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