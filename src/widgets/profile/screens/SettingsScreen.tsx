import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useLanguage } from '@shared/context/language-provider'
import { useUser } from '@shared/context/user-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { MenuGroup, MenuItem } from '@shared/ui/modals/menu-item'
import { Text } from '@shared/ui/text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const SettingsScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()
    const { user } = useUser()

    return (
        <View>
            <HeaderMenuItem onBack={onBack} title={'settings.title'} />
            <View className="p-4 gap-y-4">
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
                <MenuGroup label={t('settings.preferences.title')}>
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

                {user?.email === 'bohiness@gmail.com' && (
                    <>
                        <MenuItem
                            label={t('settings.storage.title')}
                            leftIcon={'Box'}
                            isFirst
                            isLast
                            showSeparator
                            onPress={() => {
                                onNavigate('storage')
                            }}
                        />

                        <MenuItem
                            label={t('settings.logs.title')}
                            leftIcon={'Box'}
                            isFirst
                            isLast
                            showSeparator
                            onPress={() => {
                                onNavigate('logs')
                            }}
                        />
                        <MenuItem
                            label={t('settings.revenuecat.title')}
                            leftIcon={'Box'}
                            isFirst
                            isLast
                            showSeparator
                            onPress={() => {
                                onNavigate('revenuecat')
                            }}
                        />
                    </>
                )
                }
            </View>
        </View>
    )
}