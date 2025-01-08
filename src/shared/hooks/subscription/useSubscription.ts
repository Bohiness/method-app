// src/shared/hooks/subscription/useSubscription.ts
import { subscriptionService } from '@shared/lib/subscription/subscription.service'
import { SubscriptionPlan, SubscriptionStatus } from '@shared/types/subscription/SubscriptionType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useSubscription() {
    const queryClient = useQueryClient();

    // Получение статуса подписки
    const { data: status, isLoading: isStatusLoading } = useQuery<SubscriptionStatus | null>({
        queryKey: ['subscription-status'],
        queryFn: () => subscriptionService.getSubscriptionStatus(),
        staleTime: 1000 * 60 * 5, // 5 минут
    });

    // Получение доступных планов
    const { data: plans, isLoading: isPlansLoading } = useQuery<SubscriptionPlan[]>({
        queryKey: ['subscription-plans'],
        queryFn: () => subscriptionService.getAvailablePlans(),
        staleTime: 1000 * 60 * 60, // 1 час
    });

    // Мутация для подписки
    const { mutate: subscribe, isLoading: isSubscribing } = useMutation({
        mutationFn: (planId: string) => subscriptionService.subscribe(planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        },
    });

    // Мутация для отмены подписки
    const { mutate: cancelSubscription, isLoading: isCancelling } = useMutation({
        mutationFn: () => subscriptionService.cancelSubscription(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        },
    });

    // Мутация для восстановления подписки
    const { mutate: restoreSubscription, isLoading: isRestoring } = useMutation({
        mutationFn: () => subscriptionService.restoreSubscription(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        },
    });

    // Проверка активной подписки
    const hasActiveSubscription = status?.isActive && !status?.cancelAtPeriodEnd;

    // Проверка конкретного уровня подписки
    const hasPremium = status?.tier === 'premium' && hasActiveSubscription;
    const hasPro = status?.tier === 'pro' && hasActiveSubscription;

    return {
        status,
        plans,
        subscribe,
        cancelSubscription,
        restoreSubscription,
        isLoading: isStatusLoading || isPlansLoading,
        isSubscribing,
        isCancelling,
        isRestoring,
        hasActiveSubscription,
        hasPremium,
        hasPro,
    };
}
