import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { useCallback } from 'react'
import { useSubscription } from './useSubscription'

/**
 * Хук для удобного использования компонента SubscriptionOverlay
 * Позволяет проверить, нужно ли показывать оверлей для определенного типа подписки
 */
export const useSubscriptionOverlay = () => {
    const { isSubscribed, isPremium, isPremiumAI } = useSubscription()

    /**
     * Проверяет, нужно ли показывать оверлей для обычной подписки
     */
    const shouldShowBasicOverlay = useCallback(() => {
        return !isSubscribed
    }, [isSubscribed])

    /**
     * Проверяет, нужно ли показывать оверлей для премиум функций
     */
    const shouldShowPremiumOverlay = useCallback(() => {
        return !isPremium
    }, [isPremium])

    /**
     * Проверяет, нужно ли показывать оверлей для AI функций
     */
    const shouldShowAIOverlay = useCallback(() => {
        return !isPremiumAI
    }, [isPremiumAI])

    /**
     * Проверяет, нужно ли показывать оверлей для определенного типа подписки
     */
    const shouldShowOverlay = useCallback((plan: SubscriptionPlan) => {
        switch (plan) {
            case 'premium':
                return shouldShowPremiumOverlay()
            case 'premium_ai':
                return shouldShowAIOverlay()
            default:
                return false
        }
    }, [shouldShowPremiumOverlay, shouldShowAIOverlay])

    return {
        shouldShowBasicOverlay,
        shouldShowPremiumOverlay,
        shouldShowAIOverlay,
        shouldShowOverlay
    }
} 