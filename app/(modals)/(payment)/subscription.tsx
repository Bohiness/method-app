import { SubscriptionScreen } from '@features/screens/SubscriptionScreen'
import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'

export default function SubscriptionModal() {
    const params = useLocalSearchParams<{ selectedPlan?: SubscriptionPlan, text?: string }>()
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
        params.selectedPlan as SubscriptionPlan || 'premium'
    )
    const navigation = useNavigation()

    useEffect(() => {
        (navigation as any).setParams({ selectedPlan, setSelectedPlan })
    }, [selectedPlan, setSelectedPlan])

    return <SubscriptionScreen
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        text={params.text}
    />
}