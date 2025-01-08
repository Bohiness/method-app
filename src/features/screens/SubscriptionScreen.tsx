import { BackgroundWithNoise } from '@shared/ui/bg/BackgroundWithNoise'
import { Button } from '@shared/ui/button'
import { Icon, IconName } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { ToggleSwitch } from '@shared/ui/toggle-switch'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SubscriptionItemProps {
  icon: IconName
  title: string
  description: string
}

const getSubscriptionPlans = (t: (key: string) => string) => ({
  premium: {
    title: t('screens.subscription.plans.premium.title'),
    description: t('screens.subscription.plans.premium.description'),
    price_annually: '$16.71',
    trial_period_days: 7,
    items: [
      {
        icon: 'Calendar',
        title: t('screens.subscription.plans.premium.features.planning.title'),
        description: t('screens.subscription.plans.premium.features.planning.description')
      },
      {
        icon: 'Target',
        title: t('screens.subscription.plans.premium.features.goals.title'),
        description: t('screens.subscription.plans.premium.features.goals.description')
      },
      {
        icon: 'Blend',
        title: t('screens.subscription.plans.premium.features.habits.title'),
        description: t('screens.subscription.plans.premium.features.habits.description')
      },
      {
        icon: 'Zap',
        title: t('screens.subscription.plans.premium.features.analytics.title'),
        description: t('screens.subscription.plans.premium.features.analytics.description')
      },
      {
        icon: 'MessageCircle',
        title: t('screens.subscription.plans.premium.features.motivation.title'),
        description: t('screens.subscription.plans.premium.features.motivation.description')
      },
      {
        icon: 'Bell',
        title: t('screens.subscription.plans.premium.features.reminders.title'),
        description: t('screens.subscription.plans.premium.features.reminders.description')
      },
      {
        icon: 'BrainCircuit',
        title: t('screens.subscription.plans.premium.features.state.title'),
        description: t('screens.subscription.plans.premium.features.state.description')
      }
    ]
  },
  premiumPlus: {
    title: t('screens.subscription.plans.premiumPlus.title'),
    description: t('screens.subscription.plans.premiumPlus.description'),
    price_annually: '$86.13',
    trial_period_days: 7,
    items: [
      {
        icon: 'Mic',
        title: t('screens.subscription.plans.premiumPlus.features.voice.title'),
        description: t('screens.subscription.plans.premiumPlus.features.voice.description')
      },
      {
        icon: 'CalendarClock',
        title: t('screens.subscription.plans.premiumPlus.features.voiceTasks.title'),
        description: t('screens.subscription.plans.premiumPlus.features.voiceTasks.description')
      },
      {
        icon: 'Sparkles',
        title: t('screens.subscription.plans.premiumPlus.features.smartInput.title'),
        description: t('screens.subscription.plans.premiumPlus.features.smartInput.description')
      },
      {
        icon: 'Bot',
        title: t('screens.subscription.plans.premiumPlus.features.aiAnalytics.title'),
        description: t('screens.subscription.plans.premiumPlus.features.aiAnalytics.description')
      },
      {
        icon: 'BrainCircuit',
        title: t('screens.subscription.plans.premiumPlus.features.smartReminders.title'),
        description: t('screens.subscription.plans.premiumPlus.features.smartReminders.description')
      }
    ]
  }
})


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


const SubscriptionScreen = () => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'premiumPlus'>('premium')

  const subscriptionPlans = getSubscriptionPlans(t)
  const currentPlan = subscriptionPlans[selectedPlan]

  const getAnnualPrice = () => {
    const annually = currentPlan.price_annually
    const monthlyInAnnual = (Number(annually.replace('$', '')) / 12).toFixed(2)
    return { annually, monthlyInAnnual }
  }

  const prices = getAnnualPrice()

  return (
    <BackgroundWithNoise
      className="flex-1 bg-surface-paper dark:bg-surface-paper-dark mt-6"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1">
        <ScrollView className="flex-1">
          <View className="px-6 py-4">
            <ToggleSwitch
              value={selectedPlan === 'premiumPlus'}
              onChange={(isChecked) => setSelectedPlan(isChecked ? 'premiumPlus' : 'premium')}
              leftLabel={t('screens.subscription.toggle.premium')}
              rightLabel={t('screens.subscription.toggle.premiumPlus')}
              size="md"
              disabled={false}
            />
          </View>

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
                  icon={item.icon}
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
            <Text className="text-center mb-1" weight="bold">
              {t('screens.subscription.trial.title', { days: currentPlan.trial_period_days })}
            </Text>
            <Text className="text-center mb-3" variant="secondary">
              {t('screens.subscription.price.annual', {
                price: prices.annually,
                monthly: prices.monthlyInAnnual
              })}
            </Text>
            <Button onPress={() => { }}>
              {t('screens.subscription.trial.button', { days: currentPlan.trial_period_days })}
            </Button>
            <Text variant="secondary" className="text-center mt-3">
              {t('screens.subscription.cancel.anytime')}
            </Text>
          </View>
        </View>
      </View>
    </BackgroundWithNoise>
  )
}

export default SubscriptionScreen