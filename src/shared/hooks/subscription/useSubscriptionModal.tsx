// src/shared/hooks/subscription/useSubscriptionModal.ts
import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { SubscriptionOverlay } from '@shared/ui/subscription-overlay'
import { router } from 'expo-router'
import { ReactNode, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubscription } from './useSubscription'

export const useSubscriptionModal = () => {
    const { subscription, isSubscribed, isPremium, isPremiumAI } = useSubscription()
    const { t } = useTranslation()

    const showSubscriptionModal = ({ text, plan }: { text: string, plan: SubscriptionPlan }) => {
        router.push({
            pathname: '/(modals)/(payment)/subscription',
            params: { text, selectedPlan: plan }
        })
    }

    // Показывает модальное окно подписки, если нет активной подписки
    const showSubscriptionModalIfNeeded = useCallback(async () => {
        // Проверяем наличие активной подписки
        if (!isSubscribed) {
            showSubscriptionModal({
                text: t('subscription.feature_locked'),
                plan: 'premium'
            })
            return false
        }
        return true
    }, [isSubscribed, showSubscriptionModal, t])

    // Проверяет доступность premium функций
    const checkPremiumAccess = useCallback(async ({ text = 'subscription.feature_locked' }: { text?: string }) => {
        if (!isPremium) {
            showSubscriptionModal({
                text: t(text),
                plan: 'premium'
            })
            return false
        }
        return true
    }, [isPremium, showSubscriptionModal, t])

    // Проверяет доступность AI функций
    const checkAIAccess = useCallback(async ({ text = 'subscription.feature_locked' }: { text?: string }) => {
        if (!isPremiumAI) {
            showSubscriptionModal({
                text: t(text),
                plan: 'premium_ai'
            })
            return false
        }
        return true
    }, [isPremiumAI, showSubscriptionModal, t])

    // Оборачивает компонент в SubscriptionOverlay, если требуется подписка
    const wrapWithSubscriptionOverlay = useCallback(({
        children,
        plan = 'premium',
        text = 'subscription.feature_locked',
        opacity = 0.9,
        className
    }: {
        children: ReactNode,
        plan?: SubscriptionPlan,
        text?: string,
        opacity?: number,
        className?: string
    }) => {
        const isVisible = plan === 'premium' ? !isPremium : !isPremiumAI

        return (
            <SubscriptionOverlay
                isVisible={isVisible}
                plan={plan}
                text={text}
                opacity={opacity}
                className={className}
            >
                {children}
            </SubscriptionOverlay>
        )
    }, [isPremium, isPremiumAI])

    return {
        showSubscriptionModal,
        showSubscriptionModalIfNeeded,
        checkPremiumAccess,
        checkAIAccess,
        wrapWithSubscriptionOverlay,
        isSubscribed,
        isPremium,
        isPremiumAI
    }
}