import { getSubscriptionPlans, SubscriptionPlan } from '@shared/constants/plans'
import { API_URLS } from '@shared/constants/URLS'
import { useSubscription } from '@shared/hooks/subscription/useSubscription'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { logger } from '@shared/lib/logger/logger.service'
import { BackgroundWithNoise } from '@shared/ui/bg/BackgroundWithNoise'
import { Button } from '@shared/ui/button'
import { Icon, IconName } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

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
  text?: string
  selectedPlan?: SubscriptionPlan,
  setSelectedPlan?: (plan: SubscriptionPlan) => void
}

export const SubscriptionScreen = ({ selectedPlan, setSelectedPlan, text }: SubscriptionScreenProps) => {
  const { t } = useTranslation()
  const { locale } = useLocale()
  // Флаг для отображения отладочной панели в режиме разработки

  // Получаем данные о подписках из хука
  const {
    packages,
    subscription,
    isPurchasing,
    isRestoring,
    purchase,
    restore,
    error,
    isPremium,
    isPremiumAI
  } = useSubscription()

  useEffect(() => {
    logger.log(packages, 'useEffect – SubscriptionScreen')
  }, [packages])

  useEffect(() => {
    logger.log(subscription, 'useEffect – SubscriptionScreen')
  }, [subscription])

  // Используем pаckages из RevenueCat для получения актуальных цен
  const subscriptionPlans = getSubscriptionPlans(t, packages || [])
  const currentPlan = subscriptionPlans[selectedPlan || 'premium']

  const getAnnualPrice = () => {
    const annually = currentPlan.price_annually || '$0'
    // Используем расчетную месячную цену из годовой подписки или делаем расчет на месте
    const monthlyInAnnual = currentPlan.monthly_price_in_annual ||
      `$${(Number(annually.replace('$', '')) / 12).toFixed(2)}`
    return { annually, monthlyInAnnual }
  }

  const prices = getAnnualPrice()

  const handlePurchase = async () => {
    try {
      // Находим подходящий пакет для выбранного плана
      const packageToPurchase = currentPlan.revenuecat_package

      if (!packageToPurchase) {
        console.error(error, 'No package to purchase')
        return
      }

      // Покупаем пакет
      await purchase(packageToPurchase)
    } catch (error) {
      console.error(error, 'Error purchasing subscription')
    }
  }

  // Обработчик восстановления покупок
  const handleRestore = async () => {
    try {
      const result = await restore()
      // После успешного восстановления можно показать уведомление пользователю
      // или обновить интерфейс, чтобы отразить новый статус подписки
      console.log(result, 'Purchases restored successfully')
    } catch (error) {
      console.error(error, 'Restore failed')
      // Здесь можно показать уведомление об ошибке
    }
  }

  return (
    <BackgroundWithNoise
      className="flex-1"
      variant='surface'
    >
      <View className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View
            className="px-6 pt-6"
            entering={FadeInDown.delay(100).duration(700)}
          >

            <Title className="mb-2">
              {text ?? t('screens.subscription.title')}
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
              {currentPlan.items.map((item: any, index: number) => (
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
            <Button onPress={handleRestore} variant="ghost" loading={isRestoring} disabled={isPurchasing || isRestoring}>
              {t('screens.subscription.restorePurchase')}
            </Button>
            <Button onPress={() => { Linking.openURL(API_URLS.DOCS.getTerms(locale)) }} variant="ghost">
              {t('screens.subscription.termsAndConditions')}
            </Button>
            <Button onPress={() => { Linking.openURL(API_URLS.DOCS.getPrivacy(locale)) }} variant="ghost">
              {t('screens.subscription.privacyPolicy')}
            </Button>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 bg-surface-paper dark:bg-surface-paper-dark">
          <View className="mb-6 mt-4">
            {/* Показываем текущую подписку, если она есть */}
            {subscription && subscription.isActive && (
              <View className="mb-3">
                <Text className="text-center text-success">
                  {t('screens.subscription.active', {
                    plan: isPremiumAI ? 'Premium AI' : 'Premium'
                  })}
                </Text>
                {'expiresAt' in subscription && subscription.expiresAt && (
                  <Text className="text-center" variant="secondary" size="sm">
                    {t('screens.subscription.expires', {
                      date: new Date(subscription.expiresAt).toLocaleDateString()
                    })}
                  </Text>
                )}
              </View>
            )}

            <View className="mb-1 flex-row justify-center">
              <Text className="text-center" weight="bold">
                {selectedPlan === 'premium_ai' ? t('screens.subscription.plans.premium_ai.title') : t('screens.subscription.plans.premium.title')}
              </Text>
              <Text>
                {' / '}
              </Text>
              <Text className="text-center" weight="bold">
                {isPremiumAI ? t('screens.subscription.plans.premium_ai.annual') : t('screens.subscription.plans.premium.annual')}
              </Text>
            </View>

            <Text className="text-center mb-4" weight="bold">
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
              {subscription
                ? isPremiumAI
                  ? t('screens.subscription.alreadySubscribed')
                  : t('screens.subscription.upgrade')
                : t('screens.subscription.trial.button', { days: currentPlan.trial_period_days })}
            </Button>

            {error && (
              <Text variant="error" className="text-center mt-2">
                {t('screens.subscription.error')}
              </Text>
            )}

            <Text className="text-center mt-3" variant="secondary">
              {t('screens.subscription.cancel.anytime')}
            </Text>
          </View>
        </View>
      </View>
    </BackgroundWithNoise>
  )
}