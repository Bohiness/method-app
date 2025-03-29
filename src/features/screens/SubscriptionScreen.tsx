import { getSubscriptionPlans, SubscriptionPeriod, SubscriptionPlan, SubscriptionPlanInfo } from '@shared/constants/plans'
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
import { Linking, Pressable, ScrollView } from 'react-native'
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

// Функция для создания компонента карточки плана
const PlanCard = ({
  plan,
  period,
  isSelected,
  subscriptionPlans,
  setSelectedPlan,
  setSubscriptionPeriod
}: {
  plan: SubscriptionPlan,
  period: SubscriptionPeriod,
  isSelected: boolean,
  subscriptionPlans: Record<SubscriptionPlan, SubscriptionPlanInfo>,
  setSelectedPlan: (plan: SubscriptionPlan) => void,
  setSubscriptionPeriod: (period: SubscriptionPeriod) => void
}) => {
  const { t } = useTranslation()
  const planInfo = subscriptionPlans[plan]
  const price = period === 'monthly' ? planInfo.price_monthly : planInfo.price_annually

  // Определяем цвета в зависимости от плана и выбора
  let bgColor = 'bg-surface-paper dark:bg-surface-paper-dark'
  let borderColor = 'border-border dark:border-border-dark'

  if (isSelected) {
    if (plan === 'premium') {
      bgColor = 'bg-tint/10 dark:bg-tint-dark/20'
      borderColor = 'border-tint dark:border-tint-dark'
    } else {
      bgColor = 'bg-success/10 dark:bg-success-dark/20'
      borderColor = 'border-success dark:border-success-dark'
    }
  }

  const iconName: IconName = plan === 'premium' ? 'Zap' : 'BrainCircuit'

  return (
    <View
      className="flex-1"
    >
      <View
        className={`p-4 rounded-xl border ${borderColor} ${bgColor} ${isSelected ? 'border-2' : 'border'}`}
        style={{ minHeight: 120 }}
      >
        <Pressable
          className="flex-1"
          onPress={() => {
            setSelectedPlan(plan)
            setSubscriptionPeriod(period)
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Icon
                name={iconName}
                size={20}
                variant={plan === 'premium' ? 'tint' : 'success'}
              />
              <Text weight="semibold" className="ml-2">
                {plan === 'premium'
                  ? t('screens.subscription.plans.premium.title')
                  : t('screens.subscription.plans.premium_ai.title')}
              </Text>
            </View>
            {isSelected && (
              <Icon name="Check" size={18} variant={plan === 'premium' ? 'tint' : 'success'} />
            )}
          </View>

          <View className="mb-2">
            <Text
              size="sm"
              variant="secondary"
            >
              {period === 'monthly'
                ? t('screens.subscription.plans.period.monthly')
                : t('screens.subscription.plans.period.annually')}
            </Text>
          </View>

          <View className="mt-1">
            <Text weight="bold" size="lg">{price}</Text>
            {period === 'annually' && (
              <Text
                size="xs"
                variant="secondary"
              >
                {t('screens.subscription.price.perMonth', {
                  price: planInfo.monthly_price_in_annual
                })}
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  )
}

export interface SubscriptionScreenProps {
  text?: string
  selectedPlanFromProps?: SubscriptionPlan
  onPlanChange?: (plan: SubscriptionPlan) => void
  subscriptionPeriodFromProps?: SubscriptionPeriod
  onSubscriptionPeriodChange?: (period: SubscriptionPeriod) => void
}

export const SubscriptionScreen = ({
  text,
  selectedPlanFromProps,
  onPlanChange,
  subscriptionPeriodFromProps,
  onSubscriptionPeriodChange
}: SubscriptionScreenProps) => {
  const { t } = useTranslation()
  const { locale } = useLocale()
  // Состояние для выбранного плана
  const [selectedPlan, setSelectedPlanInternal] = React.useState<SubscriptionPlan>(selectedPlanFromProps || 'premium_ai')
  // Состояние для периода подписки
  const [subscriptionPeriod, setSubscriptionPeriodInternal] = React.useState<SubscriptionPeriod>(subscriptionPeriodFromProps || 'annually')
  const [showExtraSubscription, setShowExtraSubscription] = React.useState(false)
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

  // Используем pаckages из RevenueCat для получения актуальных цен
  const subscriptionPlans = getSubscriptionPlans(t, packages || [])
  // Получаем данные для ВЫБРАННОГО плана
  const currentPlanInfo = subscriptionPlans[selectedPlan]

  // Эффект для синхронизации ВНУТРЕННЕГО плана с ВНЕШНИМ пропсом
  useEffect(() => {
    // Обновляем внутренний стейт, только если проп изменился и отличается от внутреннего
    if (selectedPlanFromProps && selectedPlanFromProps !== selectedPlan) {
      setSelectedPlanInternal(selectedPlanFromProps)
      // Опционально: Принудительно переключать на годовой период при смене плана извне?
      setSubscriptionPeriodInternal('annually')
      if (onSubscriptionPeriodChange) {
        onSubscriptionPeriodChange('annually')
      }
    }
    // Добавляем selectedPlan в зависимости, чтобы избежать зацикливания,
    // если обновление внутреннего стейта триггерит коллбэк, который меняет проп
  }, [selectedPlanFromProps])

  // Эффект для синхронизации ВНУТРЕННЕГО периода с ВНЕШНИМ пропсом
  useEffect(() => {
    if (subscriptionPeriodFromProps && subscriptionPeriodFromProps !== subscriptionPeriod) {
      setSubscriptionPeriodInternal(subscriptionPeriodFromProps)
    }
    // Добавляем subscriptionPeriod в зависимости
  }, [subscriptionPeriodFromProps])

  // Обработчик выбора ПЛАНА (вызывается из PlanCard)
  const handleSetSelectedPlan = (plan: SubscriptionPlan) => {
    // 1. Обновляем внутреннее состояние
    setSelectedPlanInternal(plan)
    // 2. Вызываем колбэк родителя (если он есть)
    if (onPlanChange) {
      onPlanChange(plan)
    }
  }

  // Обработчик выбора ПЕРИОДА (вызывается из PlanCard)
  const handleSetSubscriptionPeriod = (period: SubscriptionPeriod) => {
    // 1. Обновляем внутреннее состояние
    setSubscriptionPeriodInternal(period)
    // 2. Вызываем колбэк родителя (если он есть)
    if (onSubscriptionPeriodChange) {
      onSubscriptionPeriodChange(period)
    }
  }

  // Обновим функцию получения цены с учетом ВЫБРАННОГО периода и плана
  const getPriceInfo = () => {
    if (!currentPlanInfo) {
      return { price: '$0', isMonthly: true }
    }
    if (subscriptionPeriod === 'monthly') {
      return {
        price: currentPlanInfo.price_monthly || '$0',
        isMonthly: true
      }
    } else {
      return {
        price: currentPlanInfo.price_annually || '$0',
        monthlyPrice: currentPlanInfo.monthly_price_in_annual || '$0',
        isMonthly: false
      }
    }
  }

  const priceInfo = getPriceInfo()

  const handlePurchase = async () => {
    try {
      // Находим подходящий пакет для ВЫБРАННОГО плана и ПЕРИОДА
      const packageToPurchase = subscriptionPeriod === 'monthly'
        ? currentPlanInfo?.revenuecat_package_monthly
        : currentPlanInfo?.revenuecat_package_annually

      // --- ДОБАВЬ ЛОГ ЗДЕСЬ ---
      logger.debug(
        {
          selectedPlan,
          subscriptionPeriod,
          currentPlanInfoExists: !!currentPlanInfo,
          monthlyPackageExists: !!currentPlanInfo?.revenuecat_package_monthly,
          annualPackageExists: !!currentPlanInfo?.revenuecat_package_annually,
          selectedPackageIdentifier: packageToPurchase?.identifier,
          selectedPackageProductIdentifier: packageToPurchase?.product?.identifier,
        },
        'handlePurchase - Before package check'
      )
      // ------------------------

      if (!packageToPurchase) {
        const errMessage = `No package found for plan: ${selectedPlan}, period: ${subscriptionPeriod}`
        logger.error(errMessage, 'handlePurchase')
        return
      }

      // --- ДОБАВЬ ЛОГ ЗДЕСЬ ---
      // Переместим лог сюда, чтобы убедиться, что пакет найден
      logger.log(
        {
          identifier: packageToPurchase.identifier,
          productIdentifier: packageToPurchase.product.identifier,
          price: packageToPurchase.product.priceString,
        },
        'handlePurchase',
        `Attempting to purchase package for ${selectedPlan} - ${subscriptionPeriod}`
      )
      // ------------------------
      // Покупаем пакет
      await purchase(packageToPurchase)
    } catch (error) {
      logger.error(error, 'Error purchasing subscription in handlePurchase')
    }
  }

  // Обработчик восстановления покупок
  const handleRestore = async () => {
    try {
      const result = await restore()
      // После успешного восстановления можно показать уведомление пользователю
      // или обновить интерфейс, чтобы отразить новый статус подписки
      logger.info(result, 'Purchases restored successfully')
    } catch (error) {
      logger.error(error, 'Restore failed')
      // Здесь можно показать уведомление об ошибке
    }
  }

  return (
    <BackgroundWithNoise
      className="flex-1"
      variant='surface'
    >
      <View className="flex-1">
        {/* Блок с информацией о подписке прокручиваемый */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View
            className="px-4 pt-6"
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
            className="px-4"
            entering={FadeInDown.delay(200).duration(700)}
          >
            <View className='bg-background dark:bg-background-dark rounded-2xl'>
              {currentPlanInfo.items.map((item: any, index: number) => (
                <SubscriptionItem
                  key={index}
                  icon={item.icon as IconName}
                  title={item.title}
                  description={item.description}
                  isLast={index === currentPlanInfo.items.length - 1}
                />
              ))}
            </View>
          </Animated.View>

          <Text className="text-center mt-6 px-4" size="sm" variant="secondary">
            {t('screens.subscription.disclaimer')}
          </Text>

          {/* Сетка планов подписки */}
          {!showExtraSubscription && (
            <Button className='w-fit mx-auto mt-4' onPress={() => setShowExtraSubscription(!showExtraSubscription)} variant="outline">
              {showExtraSubscription ? t('screens.subscription.hidePlans') : t('screens.subscription.showPlans')}
            </Button>
          )}

          {showExtraSubscription && (
            <View
              className="px-4 py-10"
            >
              <Text weight="semibold" size="lg" className="text-center mb-6">
                {t('screens.subscription.selectPlan')}
              </Text>

              <View className="flex-row mb-4 gap-3">
                <PlanCard
                  plan="premium"
                  period="monthly"
                  isSelected={selectedPlan === 'premium' && subscriptionPeriod === 'monthly'}
                  subscriptionPlans={subscriptionPlans}
                  setSelectedPlan={handleSetSelectedPlan}
                  setSubscriptionPeriod={handleSetSubscriptionPeriod}
                />
                <PlanCard
                  plan="premium_ai"
                  period="monthly"
                  isSelected={selectedPlan === 'premium_ai' && subscriptionPeriod === 'monthly'}
                  subscriptionPlans={subscriptionPlans}
                  setSelectedPlan={handleSetSelectedPlan}
                  setSubscriptionPeriod={handleSetSubscriptionPeriod}
                />
              </View>

              <View className="flex-row gap-3">
                <PlanCard
                  plan="premium"
                  period="annually"
                  isSelected={selectedPlan === 'premium' && subscriptionPeriod === 'annually'}
                  subscriptionPlans={subscriptionPlans}
                  setSelectedPlan={handleSetSelectedPlan}
                  setSubscriptionPeriod={handleSetSubscriptionPeriod}
                />
                <PlanCard
                  plan="premium_ai"
                  period="annually"
                  isSelected={selectedPlan === 'premium_ai' && subscriptionPeriod === 'annually'}
                  subscriptionPlans={subscriptionPlans}
                  setSelectedPlan={handleSetSelectedPlan}
                  setSubscriptionPeriod={handleSetSubscriptionPeriod}
                />
              </View>

              <View className="my-4">
                <Text className="text-center" variant="secondary" size="sm">
                  {t('screens.subscription.bestDeal')}
                </Text>
              </View>
            </View>
          )}


          {/* Блок с кнопками действий */}
          <View className="px-4 py-4">
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

        {/* Блок с кнопками и информацией о подписке */}
        <View className="px-4 pb-6 bg-surface-paper dark:bg-surface-paper-dark">
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
                {subscriptionPeriod === 'annually'
                  ? t('screens.subscription.plans.period.annually')
                  : t('screens.subscription.plans.period.monthly')}
              </Text>
            </View>

            <Text className="text-center mb-4" weight="bold">
              {subscriptionPeriod === 'annually'
                ? t('screens.subscription.price.annual', {
                  price: priceInfo.price,
                  monthly: priceInfo.monthlyPrice
                })
                : t('screens.subscription.price.monthly', {
                  price: priceInfo.price
                })}
            </Text>

            <Button
              onPress={handlePurchase}
              loading={isPurchasing}
              disabled={isPurchasing || isRestoring || !currentPlanInfo}
            >
              {
                isPremiumAI && selectedPlan === 'premium_ai'
                  ? t('screens.subscription.alreadySubscribed')
                  : isPremium && !isPremiumAI && selectedPlan === 'premium'
                    ? t('screens.subscription.alreadySubscribed')
                    : (subscriptionPeriod === 'annually'
                      ? (currentPlanInfo?.annually_trial_period_days ?? 0) > 0
                        ? t('screens.subscription.trial.button', { days: currentPlanInfo?.annually_trial_period_days ?? 0 })
                        : t('screens.subscription.subscribe')
                      : (currentPlanInfo?.montly_trial_period_days ?? 0) > 0
                        ? t('screens.subscription.trial.button', { days: currentPlanInfo?.montly_trial_period_days ?? 0 })
                        : t('screens.subscription.subscribe')
                    )
              }
            </Button>

            {error && (
              <Text variant="error" className="text-center mt-2">
                {t('screens.subscription.error.wrong_purchase')}
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