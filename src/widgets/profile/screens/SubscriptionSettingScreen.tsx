import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { API_URLS } from '@shared/constants/URLS'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { useSubscription } from '@shared/hooks/subscription/useSubscription'
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'

export const SubscriptionSettingScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()
    const { showSubscriptionModal } = useSubscriptionModal()
    const { locale } = useLocale()

    const {
        subscription,
        isPremium,
        isPremiumAI,
        isRestoring,
        isPurchasing,
        restore
    } = useSubscription()

    // Функция форматирования даты истечения подписки
    const formatExpiryDate = (date: string) => {
        return new Date(date).toLocaleDateString()
    }

    // Функция для показа модального окна подписки с нужным планом
    const handleShowSubscriptionModal = (plan: 'premium' | 'premium_ai' = 'premium') => {
        showSubscriptionModal({
            plan
        })
    }

    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('settings.subscription.title')} />

            <View>
                {isPremium && subscription ? (
                    // Информация об активной подписке
                    <View className="mb-4">
                        <View className="flex-row items-center mb-4">
                            <Icon name="Check" className="text-success mr-2" />
                            <Title>{t('settings.subscription.active')}</Title>
                        </View>

                        <Text className="mb-2">
                            {t('settings.subscription.plan', {
                                plan: isPremiumAI ? t('screens.subscription.plans.premium_ai.title') : t('screens.subscription.plans.premium.title')
                            })}
                        </Text>

                        {subscription && 'expiresAt' in subscription && subscription.expiresAt && (
                            <Text variant="secondary">
                                {t('settings.subscription.expires', {
                                    date: formatExpiryDate(subscription.expiresAt)
                                })}
                            </Text>
                        )}

                        {subscription && 'autoRenew' in subscription && subscription.autoRenew ? (
                            <Text variant="success" className="mt-2">
                                {t('settings.subscription.autoRenewEnabled')}
                            </Text>
                        ) : (
                            <Text variant="warning" className="mt-2">
                                {t('settings.subscription.autoRenewDisabled')}
                            </Text>
                        )}

                        {!isPremiumAI && (
                            <Button
                                variant="outline"
                                className="mt-4"
                                onPress={() => handleShowSubscriptionModal('premium_ai')}
                                loading={isPurchasing}
                            >
                                {t('settings.subscription.upgrade')}
                            </Button>
                        )}
                    </View>
                ) : (
                    // Кнопки для активации подписки
                    <View>
                        <View className="bg-surface-paper dark:bg-surface-paper-dark rounded-2xl p-4 mb-4">
                            <Title className="mb-2">{t('settings.subscription.noActive')}</Title>
                            <Text variant="secondary" className="mb-4">
                                {t('settings.subscription.tryPremium')}
                            </Text>
                            <Button
                                variant="default"
                                onPress={() => handleShowSubscriptionModal('premium_ai')}
                                loading={isPurchasing}
                            >
                                {t('settings.subscription.activatePremium')}
                            </Button>
                        </View>
                    </View>
                )}

                {/* Кнопки восстановления покупок */}
                <View className="mt-4">
                    <Button
                        variant="ghost"
                        onPress={() => restore()}
                        loading={isRestoring}
                    >
                        {t('settings.subscription.restorePurchases')}
                    </Button>
                </View>

                {/* Ссылки на документы */}
                <View>
                    <Button
                        variant="ghost"
                        onPress={() => { Linking.openURL(API_URLS.DOCS.getTerms(locale)) }}
                    >
                        {t('settings.subscription.terms')}
                    </Button>
                    <Button
                        variant="ghost"
                        onPress={() => { Linking.openURL(API_URLS.DOCS.getPrivacy(locale)) }}
                    >
                        {t('settings.subscription.privacy')}
                    </Button>
                </View>
            </View>
        </View>
    )
}