import { getSubscriptionPlans } from '@shared/constants/plans'
import { useSubscription } from '@shared/hooks/subscription/useSubscription'
import { BackgroundWithNoise } from '@shared/ui/bg/BackgroundWithNoise'
import { Button } from '@shared/ui/button'
import { Icon, IconName } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SubscriptionItemProps {
  icon: IconName
  title: string
  description: string
}

const SubscriptionItem: React.FC<SubscriptionItemProps & { isLast?: boolean }> = ({
  icon,
  title,
  description,
  isLast
}) => (
  <View className={`flex-row items-start p-4 
    ${!isLast ? 'border-b border-border dark:border-border-dark' : ''} `}
  >
    <View className="w-8 h-8 mr-4 items-center justify-center">
      <Icon name={icon} size={24} />
    </View>
    <View className="flex-1">
      <Text className="font-semibold text-base mb-1">{title}</Text>
      <Text variant="secondary" size="sm">{description}</Text>
    </View>
  </View>
)

export interface SubscriptionScreenProps {
  selectedPlan?: 'premium' | 'premiumPlus',
  setSelectedPlan?: (plan: 'premium' | 'premiumPlus') => void
}

export const SubscriptionScreen = ({ selectedPlan, setSelectedPlan }: SubscriptionScreenProps) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const subscriptionPlans = getSubscriptionPlans(t)
  const currentPlan = subscriptionPlans[selectedPlan || 'premium']

  // Добавляем использование хука useSubscription
  const {
    packages,
    subscription,
    isPurchasing,
    isRestoring,
    purchase,
    restore,
    error,
    isSubscribed,
    isPremium,
    isPremiumAI
  } = useSubscription()

  const getAnnualPrice = () => {
    const annually = currentPlan.price_annually
    const monthlyInAnnual = (Number(annually.replace('$', '')) / 12).toFixed(2)
    return { annually, monthlyInAnnual }
  }

  const prices = getAnnualPrice()

  // Обработчик покупки подписки
  const handlePurchase = async () => {
    if (!packages) return

    const packageToPurchase = packages.find(pkg =>
      pkg.identifier.includes(selectedPlan === 'premiumPlus' ? 'premium_ai' : 'premium')
    )

    if (packageToPurchase) {
      try {
        await purchase(packageToPurchase)
      } catch (error) {
        console.error('Purchase failed:', error)
      }
    }
  }

  // Обработчик восстановления покупок
  const handleRestore = async () => {
    try {
      await restore()
    } catch (error) {
      console.error('Restore failed:', error)
    }
  }


  return (
    <BackgroundWithNoise
      className="flex-1 bg-surface-paper dark:bg-surface-paper-dark"
    >
      <View className="flex-1">
        <ScrollView className="flex-1">
          <Animated.View
            className="px-6 pt-6"
            entering={FadeInDown.delay(100).duration(700)}
          >
            <Title className="mb-2">
              {t('screens.subscription.title')}
            </Title>
            <Text className="mb-8" variant="secondary">
              {t('screens.subscription.subtitle')}
            </Text>
          </Animated.View>

          <Animated.View
            className="px-6"
            entering={FadeInDown.delay(200).duration(700)}
          >
            <View className='bg-background dark:bg-background-dark rounded-2xl'>
              {currentPlan.items.map((item, index) => (
                <SubscriptionItem
                  key={index}
                  icon={item.icon as IconName}
                  title={item.title}
                  description={item.description}
                  isLast={index === currentPlan.items.length - 1}
                />
              ))}
            </View>
          </Animated.View>

          <View className="px-6 py-4">
            <Text className="text-center my-6" variant="secondary">
              {t('screens.subscription.disclaimer')}
            </Text>
            <Button onPress={() => { }} variant="ghost">
              {t('screens.subscription.restorePurchase')}
            </Button>
            <Button onPress={() => { }} variant="ghost">
              {t('screens.subscription.termsAndConditions')}
            </Button>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 bg-surface-paper dark:bg-surface-paper-dark">
          <View className="mb-6 mt-4">
            {/* Показываем текущую подписку, если она есть */}
            {isSubscribed && (
              <Text className="text-center mb-3 text-success">
                {t('screens.subscription.active', {
                  plan: isPremiumAI ? 'Premium AI' : 'Premium'
                })}
              </Text>
            )}

            <Text className="text-center mb-1" weight="bold">
              {t('screens.subscription.trial.title', { days: currentPlan.trial_period_days })}
            </Text>
            <Text className="text-center mb-3" variant="secondary">
              {t('screens.subscription.price.annual', {
                price: prices.annually,
                monthly: prices.monthlyInAnnual
              })}
            </Text>

            <Button
              onPress={handlePurchase}
              loading={isPurchasing}
              disabled={isPurchasing || isRestoring}
            >
              {isSubscribed
                ? t('screens.subscription.upgrade')
                : t('screens.subscription.trial.button', { days: currentPlan.trial_period_days })}
            </Button>

            {error && (
              <Text variant="error" className="text-center mt-2">
                {t('screens.subscription.error')}
              </Text>
            )}

            <Text variant="secondary" className="text-center mt-3">
              {t('screens.subscription.cancel.anytime')}
            </Text>
          </View>
        </View>
      </View>
    </BackgroundWithNoise>
  )
}