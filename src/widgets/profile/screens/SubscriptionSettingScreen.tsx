import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useIAP } from '@shared/hooks/subscription/useIAP'
import { useSubscription } from '@shared/hooks/subscription/useSubscription'
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'
import { ScreenType } from '../SettingModal'

export const SubscriptionSettingScreen = ({ onBack, onNavigate }: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()
    const { showSubscriptionModal } = useSubscriptionModal()

    const {
        status,
        hasActiveSubscription,
        hasPremium,
        hasPro,
        cancelSubscription,
        restoreSubscription,
        isLoading
    } = useSubscription()

    const {
        restorePurchases,
        isRestoring,
        isPurchasing
    } = useIAP()

    // Функция форматирования даты истечения подписки
    const formatExpiryDate = (date: string) => {
        return new Date(date).toLocaleDateString()
    }

    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('settings.subscription.title')} />

            <View>
                {hasActiveSubscription ? (
                    // Информация об активной подписке
                    <View className="mb-4">
                        <View className="flex-row items-center mb-4">
                            <Icon name="CheckCircle" className="text-success mr-2" />
                            <Title>{t('settings.subscription.active')}</Title>
                        </View>

                        <Text className="mb-2">
                            {t('settings.subscription.plan', {
                                plan: hasPro ? 'Pro' : 'Premium'
                            })}
                        </Text>

                        {status?.expiresAt && (
                            <Text variant="secondary">
                                {t('settings.subscription.expires', {
                                    date: formatExpiryDate(status.expiresAt)
                                })}
                            </Text>
                        )}

                        {status?.autoRenew ? (
                            <Text variant="success" className="mt-2">
                                {t('settings.subscription.autoRenewEnabled')}
                            </Text>
                        ) : (
                            <Text variant="warning" className="mt-2">
                                {t('settings.subscription.autoRenewDisabled')}
                            </Text>
                        )}

                        <Button
                            variant="outline"
                            className="mt-4"
                            onPress={() => cancelSubscription()}
                            loading={isLoading}
                        >
                            {t('settings.subscription.cancelSubscription')}
                        </Button>
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
                                onPress={showSubscriptionModal}
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
                        onPress={() => restorePurchases()}
                        loading={isRestoring}
                    >
                        {t('settings.subscription.restorePurchases')}
                    </Button>
                </View>

                {/* Дополнительные ссылки */}
                <View>
                    <Button
                        variant="ghost"
                        onPress={() => {/* Открыть условия использования */ }}
                    >
                        {t('settings.subscription.terms')}
                    </Button>
                    <Button
                        variant="ghost"
                        onPress={() => {/* Открыть политику конфиденциальности */ }}
                    >
                        {t('settings.subscription.privacy')}
                    </Button>
                </View>
            </View>
        </View>
    )
}