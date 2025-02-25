// src/shared/hooks/subscription/useSubscriptionModal.ts
import { router } from 'expo-router'
import { useCallback } from 'react'
import { useSubscription } from './useSubscription'

export const useSubscriptionModal = () => {
    const { subscription, isSubscribed, isPremium, isPremiumAI } = useSubscription()

    const showSubscriptionModal = () => {
        router.push('/(modals)/(payment)/subscription')
    }

    // Показывает модальное окно подписки, если нет активной подписки
    const showSubscriptionModalIfNeeded = useCallback(async () => {
        // Проверяем наличие активной подписки
        if (!isSubscribed) {
            showSubscriptionModal()
            return false
        }
        return true
    }, [isSubscribed, showSubscriptionModal])

    // Проверяет доступность premium функций
    const checkPremiumAccess = useCallback(async () => {
        if (!isPremium) {
            showSubscriptionModal()
            return false
        }
        return true
    }, [isPremium, showSubscriptionModal])

    // Проверяет доступность AI функций
    const checkAIAccess = useCallback(async () => {
        if (!isPremiumAI) {
            showSubscriptionModal()
            return false
        }
        return true
    }, [isPremiumAI, showSubscriptionModal])

    return {
        showSubscriptionModal,
        showSubscriptionModalIfNeeded,
        checkPremiumAccess,
        checkAIAccess,
        isSubscribed,
        isPremium,
        isPremiumAI
    }
}