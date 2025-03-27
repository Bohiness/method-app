import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { APP_ROUTES } from '@shared/constants/system/app-routes'
import { useLanguage } from '@shared/context/language-provider'
import { useUser } from '@shared/context/user-provider'
import { useToneOfVoice } from '@shared/hooks/ai/toneOfVoice.hook'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { useSubscription } from '@shared/hooks/subscription/useSubscription'
import { logger } from '@shared/lib/logger/logger.service'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { MenuGroup, MenuItem } from '@shared/ui/modals/menu-item'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
export const SettingsScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()
    const { user } = useUser()
    const { activatePlanByAdmin, deactivatePlanByAdmin } = useSubscription()
    const { currentTone } = useToneOfVoice()

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
                        leftIcon={'Languages'}
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

                <MenuGroup label={t('settings.ai.title')}>
                    <MenuItem
                        label={t('settings.ai.aiToneOfVoice.title')}
                        leftIcon={'ChartNoAxesGantt'}
                        rightContent={
                            <Badge size="sm" variant="outline" style={{ borderColor: currentTone?.gradient[0] }}>
                                {currentTone?.name}
                            </Badge>
                        }
                        onPress={() => {
                            router.push(`/${APP_ROUTES.MODALS.SETTINGS.AI_TONE_OF_VOICE}`)
                        }}
                    />
                </MenuGroup>


                <MenuGroup label={t('settings.debug.title')}>
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
                </MenuGroup>

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
                            <MenuItem
                                label={t('settings.journal.title')}
                                leftIcon={'Box'}
                                isFirst
                                isLast
                                showSeparator
                                onPress={() => {
                                    onNavigate('journal')
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