import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { SubscriptionOverlay } from '@shared/ui/subscription-overlay'
import { ReactNode, useCallback } from 'react'
import { useSubscription } from './useSubscription'

/**
 * Хук для удобного использования компонента SubscriptionOverlay
 * Позволяет проверить, нужно ли показывать оверлей для определенного типа подписки
 */
export const useSubscriptionOverlay = () => {
    const { isPremium, isPremiumAI, forceRefreshSubscription } = useSubscription()

    /**
     * Проверяет, нужно ли показывать оверлей для определенного типа подписки
     */
    const shouldShowOverlay = useCallback((plan: SubscriptionPlan) => {
        switch (plan) {
            case 'premium':
                return !isPremium
            case 'premium_ai':
                return !isPremiumAI
            default:
                return false
        }
    }, [isPremium, isPremiumAI])

    /**
     * Оборачивает компонент в оверлей подписки в зависимости от требуемого плана
     */
    const wrapWithSubscriptionOverlay = useCallback(
        ({
            children,
            plan = 'premium',
            text,
            opacity = 0.9,
            className
        }: {
            children: ReactNode,
            plan?: SubscriptionPlan,
            text?: string,
            opacity?: number,
            className?: string
        }) => {
            const isVisible = shouldShowOverlay(plan)

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
        },
        [shouldShowOverlay]
    )

    /**
     * Проверяет, доступны ли премиум-функции, используя кэшированные данные
     * @returns true если премиум-доступ активен
     */
    const checkPremiumAccess = useCallback(() => {
        return isPremium
    }, [isPremium])

    /**
     * Проверяет, доступны ли функции Premium AI, используя кэшированные данные
     * @returns true если Premium AI доступ активен
     */
    const checkPremiumAIAccess = useCallback(() => {
        return isPremiumAI
    }, [isPremiumAI])

    /**
     * Обновляет статус подписки с сервера и возвращает новое состояние
     * Используйте этот метод только когда нужно убедиться в актуальности данных
     */
    const refreshSubscriptionStatus = useCallback(async () => {
        await forceRefreshSubscription()
        return {
            isPremium,
            isPremiumAI
        }
    }, [forceRefreshSubscription, isPremium, isPremiumAI])

    return {
        shouldShowOverlay,
        wrapWithSubscriptionOverlay,
        isPremium,
        isPremiumAI,
        checkPremiumAccess,
        checkPremiumAIAccess,
        refreshSubscriptionStatus
    }
} 