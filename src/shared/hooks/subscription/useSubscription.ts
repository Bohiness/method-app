// src/shared/hooks/subscription/useSubscription.ts

import { useUser } from '@shared/context/user-provider';
import { storage } from '@shared/lib/storage/storage.service';
import { subscriptionService } from '@shared/lib/subscription/subscription.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { PurchasesPackage } from 'react-native-purchases';

export const useSubscription = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();

    // Инициализация RevenueCat
    useEffect(() => {
        subscriptionService.initialize().catch(console.error);
    }, []);

    // Привязка пользователя к RevenueCat
    useEffect(() => {
        if (user?.id) {
            subscriptionService.setUserId(user.id.toString()).catch(console.error);
        }
    }, [user?.id]);

    // Получение доступных подписок
    const {
        data: packages,
        isLoading: isPackagesLoading,
        error: packagesError,
    } = useQuery({
        queryKey: ['subscription', 'packages'],
        queryFn: () => subscriptionService.getOfferings(),
    });

    // Получение статуса подписки
    const {
        data: subscription,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
    } = useQuery({
        queryKey: ['subscription', 'status'],
        queryFn: async () => {
            const savedStatus = await storage.get<SubscriptionStatus>('subscription-status', true);
            return savedStatus || { isActive: false, tier: 'free' as const };
        },
    });

    // Мутация для покупки подписки
    const purchaseMutation = useMutation({
        mutationFn: (pkg: PurchasesPackage) => subscriptionService.purchasePackage(pkg),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });

    // Мутация для восстановления покупок
    const restoreMutation = useMutation({
        mutationFn: () => subscriptionService.restorePurchases(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });

    // Проверка доступа к функциям
    const checkFeatureAccess = useCallback(
        (requiredTier: SubscriptionTier): boolean => {
            if (!subscription) return false;

            const tiers = {
                free: 0,
                premium: 1,
                premium_ai: 2,
            };

            const userTier = tiers[subscription.tier];
            const required = tiers[requiredTier];

            return userTier >= required;
        },
        [subscription]
    );

    return {
        // Данные
        packages,
        subscription,

        // Состояния загрузки
        isLoading: isPackagesLoading || isSubscriptionLoading,
        isPurchasing: purchaseMutation.isPending,
        isRestoring: restoreMutation.isPending,

        // Ошибки
        error: packagesError || subscriptionError,

        // Методы
        purchase: purchaseMutation.mutate,
        restore: restoreMutation.mutate,
        checkFeatureAccess,

        // Хелперы
        isPremium: subscription?.tier === 'premium',
        isPremiumAI: subscription?.tier === 'premium_ai',
        isSubscribed: subscription?.isActive || false,
        hasAIAccess: subscription?.tier === 'premium_ai',
        hasPremiumAccess: ['premium', 'premium_ai'].includes(subscription?.tier || 'free'),
    };
};
