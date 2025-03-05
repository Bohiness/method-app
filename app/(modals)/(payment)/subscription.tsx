import { SubscriptionScreen } from '@features/screens/SubscriptionScreen'
import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'

export default function SubscriptionModal() {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('premium')
    const navigation = useNavigation()

    useEffect(() => {
        (navigation as any).setParams({ selectedPlan, setSelectedPlan })
    }, [selectedPlan, setSelectedPlan])

    return <SubscriptionScreen selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
}