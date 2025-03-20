import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useLanguage } from '@shared/context/language-provider'
import { useUser } from '@shared/context/user-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { useSubscription } from '@shared/hooks/subscription/useSubscription'
import { logger } from '@shared/lib/logger/logger.service'
import { Button } from '@shared/ui/button'
import { MenuGroup, MenuItem } from '@shared/ui/modals/menu-item'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

export const SettingsScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()
    const { user } = useUser()
    const { activatePlanByAdmin, deactivatePlanByAdmin } = useSubscription()

    const handleActivatePlanByAdmin = async () => {
        try {
            await activatePlanByAdmin()
            Alert.alert(t('settings.admin.activatePlanByAdminSuccess'))
        } catch (err) {
            logger.error(err, 'activatePlanByAdmin', 'Failed to activate subscription')
        }
    }

    const handleDeactivatePlanByAdmin = async () => {
        try {
            await deactivatePlanByAdmin()
            Alert.alert(t('settings.admin.deactivatePlanByAdminSuccess'))
        } catch (err) {
            logger.error(err, 'deactivatePlanByAdmin', 'Failed to deactivate subscription')
        }
    }

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

                <MenuItem
                    label={t('settings.sendErrorReport.title')}
                    leftIcon={'Siren'}
                    isFirst
                    isLast
                    showSeparator
                    onPress={() => {
                        onNavigate('sendErrorReport')
                    }}
                />

                {(user?.email === 'bohiness@gmail.com' || __DEV__) && (
                    <>
                        <View variant="stone" className="p-2 rounded-lg gap-y-2">
                            <Text variant="secondary">
                                {t('settings.admin.title')}
                            </Text>
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
                            <Button
                                variant="ghost"
                                onPress={handleActivatePlanByAdmin}
                            >
                                {t('settings.admin.activatePlanByAdmin')}
                            </Button>

                            <Button
                                variant="ghost"
                                onPress={handleDeactivatePlanByAdmin}
                            >
                                {t('settings.admin.deactivatePlanByAdmin')}
                            </Button>
                        </View>
                    </>
                )}
            </View>
        </View>
    )
}