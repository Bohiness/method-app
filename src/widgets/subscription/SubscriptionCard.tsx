import { useSubscription } from '@shared/hooks/subscription/useSubscription'
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { AnimatedLock } from '@shared/ui/animated-icon/lock'
import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'

export const SubscriptionCard = () => {
    const { t } = useTranslation()
    const { showSubscriptionModal, isPremiumAI } = useSubscriptionModal()
    const { packages } = useSubscription()

    if (isPremiumAI) return null

    return (
        <View variant="paper" className="flex-1 w-max-full overflow-hidden rounded-3xl px-4 py-10">
            <View className="flex-1 items-center gap-y-6">
                {/* Замок в правом верхнем углу */}
                <AnimatedLock size={60} variant="default" className='mt-6' />

                {/* Текстовый контент */}
                <View className="gap-y-1 items-center">
                    <Title>{t('screens.subscription.title')}</Title>
                    <Text variant="secondary" className="text-center">
                        {t('screens.subscription.subtitle')}
                    </Text>
                </View>

                {/* Кнопка подписки */}
                <Button
                    variant="default"
                    onPress={() => showSubscriptionModal({ text: t('screens.subscription.title'), plan: 'premium_ai' })}
                >
                    {t('screens.subscription.trial.button', { days: packages?.[0]?.trialPeriodDays || 7 })}
                </Button>
            </View>
        </View>
    )
}

export default SubscriptionCard
