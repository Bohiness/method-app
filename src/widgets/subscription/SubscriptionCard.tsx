import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const SubscriptionCard = () => {
    const { t } = useTranslation()
    const { showSubscriptionModal } = useSubscriptionModal()

    return (
        <View className="flex-1 w-max-full overflow-hidden rounded-3xl bg-surface-paper dark:bg-surface-paper-dark px-4 py-10">
            <View className="flex-1 items-center gap-y-4">
                {/* Замок в правом верхнем углу */}
                <Icon
                    name="Lock"
                    size={40}
                    strokeWidth={1.5}
                />

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
                    onPress={showSubscriptionModal}
                >
                    {t('screens.subscription.trial.button', { days: 7 })}
                </Button>
            </View>
        </View>
    )
}

export default SubscriptionCard
