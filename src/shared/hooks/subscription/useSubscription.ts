// src/shared/hooks/subscription/useSubscription.ts

import { useUser } from '@shared/context/user-provider';
import { storage } from '@shared/lib/storage/storage.service';
import { subscriptionService } from '@shared/lib/subscription/subscription.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { PurchasesPackage } from 'react-native-purchases';

export const useSubscription = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);

    // Инициализация RevenueCat
    useEffect(() => {
        subscriptionService.initialize().catch(err => {
            console.error('Failed to initialize subscription service:', err);
            setError('Не удалось инициализировать сервис подписок');
        });
    }, []);

    // Привязка пользователя к RevenueCat
    useEffect(() => {
        if (user?.id) {
            subscriptionService.setUserId(user.id.toString()).catch(err => {
                console.error('Failed to set user ID:', err);
                setError('Не удалось привязать пользователя к подписке');
            });
        }
    }, [user?.id]);

    // Получение доступных подписок
    const {
        data: packages,
        isLoading: isPackagesLoading,
        error: packagesError,
        refetch: refetchPackages,
    } = useQuery({
        queryKey: ['subscription', 'packages'],
        queryFn: async () => {
            try {
                return await subscriptionService.getOfferings();
            } catch (err) {
                console.error('Failed to get offerings:', err);
                setError('Не удалось получить доступные подписки');
                throw err;
            }
        },
        staleTime: 1000 * 60 * 15, // 15 минут кэширования
        retry: 3,
    });

    // Получение статуса подписки с использованием кэширования
    const {
        data: subscription,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
        refetch: refetchSubscription,
    } = useQuery({
        queryKey: ['subscription', 'status', user?.id],
        queryFn: async () => {
            try {
                // Проверяем статус подписки
                const cachedStatus = await subscriptionService.checkSubscriptionStatus();

                if (cachedStatus) {
                    const savedStatus = await storage.get<SubscriptionStatus>('subscription-status', true);
                    if (savedStatus) {
                        return savedStatus;
                    }

                    return {
                        isActive: cachedStatus.isPremium || cachedStatus.isPremiumAI,
                        tier: cachedStatus.tier,
                    };
                }

                const savedStatus = await storage.get<SubscriptionStatus>('subscription-status', true);
                return savedStatus || { isActive: false, tier: 'free' as const };
            } catch (err) {
                console.error('Failed to check subscription status:', err);
                setError('Не удалось проверить статус подписки');
                throw err;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 минут
    });

    // Обновление статуса подписки при изменении пользователя
    useEffect(() => {
        if (user?.id) {
            refetchSubscription();
            refetchPackages();
        }
    }, [user?.id, refetchSubscription, refetchPackages]);

    // Мутация для покупки подписки
    const purchaseMutation = useMutation({
        mutationFn: (pkg: PurchasesPackage) => subscriptionService.purchasePackage(pkg),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            setError(null);
        },
        onError: (err: any) => {
            if (err.userCancelled) {
                console.log('Purchase cancelled by user');
                return;
            }

            console.error('Purchase error:', err);
            setError('Ошибка при покупке. Пожалуйста, попробуйте позже.');
        },
    });

    // Мутация для восстановления покупок
    const restoreMutation = useMutation({
        mutationFn: () => subscriptionService.restorePurchases(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            setError(null);
        },
        onError: (err: any) => {
            console.error('Restore error:', err);
            setError('Не удалось восстановить покупки');
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
        error,

        // Состояния загрузки
        isPackagesLoading,
        isSubscriptionLoading,
        isPurchasing: purchaseMutation.isPending,
        isRestoring: restoreMutation.isPending,

        // Статусы подписки
        isSubscribed: subscription?.isActive || false,
        isPremium: checkFeatureAccess('premium'),
        isPremiumAI: checkFeatureAccess('premium_ai'),

        // Действия
        purchase: purchaseMutation.mutate,
        restore: restoreMutation.mutate,
        refetchSubscription,
        refetchPackages,
        checkFeatureAccess,
    };
};
