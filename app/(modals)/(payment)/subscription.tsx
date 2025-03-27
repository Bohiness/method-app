import { SubscriptionScreen } from '@features/screens/SubscriptionScreen'
import { SubscriptionPeriod, SubscriptionPlan } from '@shared/constants/plans'
import { FullScreenModalHeaderWithNoise } from '@shared/ui/modals/FullScreenModalHeaderWithNoise'
import { ToggleSwitch } from '@shared/ui/toggle-switch'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export default function SubscriptionModal() {
    const params = useLocalSearchParams<{ text?: string, selectedPlan?: string }>()
    const navigation = useNavigation()
    const { t } = useTranslation()

    const initialPlan = (params.selectedPlan === 'premium' || params.selectedPlan === 'premium_ai')
        ? params.selectedPlan
        : 'premium_ai'

    const initialSubscriptionPeriod = 'annually'
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan)
    const [subscriptionPeriod, setSubscriptionPeriod] = useState<SubscriptionPeriod>(initialSubscriptionPeriod)

    const handleClose = () => {
        navigation.goBack()
    }

    return (
        <View style={{ flex: 1 }}>
            <FullScreenModalHeaderWithNoise
                variant='surface'
                centerContent={
                    <ToggleSwitch
                        value={selectedPlan === 'premium_ai'}
                        onChange={(isChecked) => setSelectedPlan(isChecked ? 'premium_ai' : 'premium')}
                        leftLabel={t('screens.subscription.toggle.premium')}
                        rightLabel={t('screens.subscription.toggle.premium_ai')}
                        size="md"
                        disabled={false}
                    />
                }
                onClose={handleClose}
            />

            <SubscriptionScreen
                selectedPlanFromProps={selectedPlan}
                onPlanChange={setSelectedPlan}
                subscriptionPeriodFromProps={subscriptionPeriod}
                onSubscriptionPeriodChange={setSubscriptionPeriod}
                text={params.text}
            />
        </View>
    )
}