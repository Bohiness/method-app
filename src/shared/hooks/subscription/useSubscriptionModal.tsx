// src/shared/hooks/subscription/useSubscriptionModal.ts
import { logger } from '@shared/lib/logger/logger.service'
import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { SubscriptionOverlay } from '@shared/ui/subscription-overlay'
import { router } from 'expo-router'
import { ReactNode, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubscription } from './useSubscription'

export const useSubscriptionModal = () => {
    const { isPremium, isPremiumAI, forceRefreshSubscription } = useSubscription()
    const { t } = useTranslation()

    /**
     * Показывает модальное окно подписки с указанными параметрами
     */
    const showSubscriptionModal = useCallback(({
        text = t('screens.subscription.title'),
        plan = 'premium'
    }: {
        text?: string,
        plan?: SubscriptionPlan
    }) => {
        router.push({
            pathname: '/(modals)/(payment)/subscription',
            params: { text, selectedPlan: plan }
        })
    }, [])

    /**
     * Показывает модальное окно подписки, если нет подписки premium
     * Если критически важно получить актуальные данные, установите forceCheck=true
     * @returns true если у пользователя есть подписка, false если нет
     */
    const showSubscriptionModalIfNeeded = useCallback(async (forceCheck = false) => {
        // Только если явно запросили обновление статуса
        if (forceCheck) {
            await forceRefreshSubscription()
        }

        if (!isPremium) {
            showSubscriptionModal({
                text: t('screens.subscription.title'),
                plan: 'premium'
            })
            return false
        }
        return true
    }, [isPremium, forceRefreshSubscription, showSubscriptionModal, t])

    /**
     * Проверяет доступность premium функций
     * @returns true если у пользователя есть премиум-доступ, false если нет
     */
    const checkPremiumAccess = useCallback(({
        text = 'subscription.feature_locked'
    }: {
        text?: string
    }) => {
        if (!isPremium) {
            showSubscriptionModal({
                text: t(text),
                plan: 'premium'
            })
            return false
        }
        return true
    }, [isPremium, showSubscriptionModal, t])

    /**
     * Проверяет доступность premium AI функций
     * @returns true если у пользователя есть премиум AI доступ, false если нет
     */
    const checkPremiumAIAccess = useCallback(({
        text = 'subscription.feature_locked'
    }: {
        text?: string
    }) => {
        if (!isPremiumAI) {
            showSubscriptionModal({
                text: t(text),
                plan: 'premium_ai'
            })
            return false
        }
        return true
    }, [isPremiumAI, showSubscriptionModal, t])

    /**
     * Оборачивает компонент в SubscriptionOverlay, если требуется подписка
     */
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
        logger.log({ plan, isPremium, isPremiumAI }, 'wrapWithSubscriptionOverlay', 'wrapWithSubscriptionOverlay')
        const isVisible = plan === 'premium' ? !isPremium : !isPremiumAI

        return (
            <SubscriptionOverlay
                isVisible={isVisible}
                plan={plan}
                text={text}
                opacity={opacity}
                className={className}
                onSubscribe={showSubscriptionModal}
            >
                {children}
            </SubscriptionOverlay>
        )
    }, [isPremium, isPremiumAI, showSubscriptionModal])

    return {
        showSubscriptionModal,
        showSubscriptionModalIfNeeded,
        checkPremiumAccess,
        checkPremiumAIAccess,
        wrapWithSubscriptionOverlay,
        isPremium,
        isPremiumAI,
        forceRefreshSubscription
    }
}