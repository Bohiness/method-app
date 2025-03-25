// src/shared/hooks/subscription/useSubscription.ts

import { QUERY_KEYS } from '@shared/constants/QUERY_KEYS';
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { SUBSCRIPTION_TIERS } from '@shared/constants/substrations/tiers';
import { useUser } from '@shared/context/user-provider';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { SubscriptionCacheService } from '@shared/lib/subscription/subscription-cache.service';
import { subscriptionService } from '@shared/lib/subscription/subscription.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { handleSubscriptionError } from './handleSubscriptionError';

// Добавляем типы ошибок подписки для более детальной обработки
export type SubscriptionErrorType =
    | 'purchase_cancelled_by_user'
    | 'network_error'
    | 'already_purchased'
    | 'receipt_invalid'
    | 'unknown_error';

export interface SubscriptionErrorInfo {
    type: SubscriptionErrorType;
    message: string;
    originalError?: any;
}

// Время кэширования статуса подписки в React Query (30 дней)
const SUBSCRIPTION_CACHE_STALE_TIME = 1000 * 60 * 60 * 24 * 30;

// Минимальный интервал между проверками подписки (5 секунд)
const MIN_CHECK_INTERVAL = 5000;

/**
 * Кастомный хук для работы с подписками
 */
export const useSubscription = () => {
    const queryClient = useQueryClient();
    const { user } = useUser();
    const [error, setError] = useState<SubscriptionErrorInfo | null>(null);
    const cacheService = useMemo(() => SubscriptionCacheService.getInstance(), []);
    const { t } = useTranslation();

    // Время последней проверки подписки
    const lastCheckRef = useRef<number>(0);
    // Флаг, указывающий что проверка уже идет
    const isCheckingRef = useRef<boolean>(false);
    // Флаг, указывающий, что первичная инициализация выполнена
    const hasInitializedRef = useRef<boolean>(false);

    // Получение статуса подписки с использованием кэширования
    const {
        data: subscription,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
        refetch: refetchSubscription,
    } = useQuery({
        queryKey: [QUERY_KEYS.SUBSCRIPTION, 'status', user?.id],
        queryFn: async () => {
            try {
                // Если первая инициализация уже была выполнена,
                // просто проверяем наличие кэшированных данных в localStorage
                if (hasInitializedRef.current) {
                    const savedStatus = await storage.get<SubscriptionStatus>(STORAGE_KEYS.SUBSCRIPTION_STATUS, true);
                    if (savedStatus) {
                        logger.log(
                            `Кэшированная подписка: ${JSON.stringify(savedStatus)}`,
                            'useSubscription - queryFn'
                        );
                        return savedStatus;
                    }
                }

                // Если это первый запуск приложения или нет кэша - делаем реальную проверку
                if (!isCheckingRef.current) {
                    isCheckingRef.current = true;
                    lastCheckRef.current = Date.now();
                    logger.log('Initial subscription check', 'useSubscription - queryFn');

                    try {
                        // Проверяем статус на сервере
                        const freshStatus = await subscriptionService.checkSubscriptionStatus();
                        hasInitializedRef.current = true;
                        isCheckingRef.current = false;

                        if (freshStatus) {
                            logger.log(
                                `Новый статус подписки: ${JSON.stringify(freshStatus)}`,
                                'useSubscription - queryFn'
                            );
                            return {
                                tier: freshStatus.tier,
                                isActive: freshStatus.isActive,
                            };
                        }
                    } catch (checkErr) {
                        isCheckingRef.current = false;
                        logger.error(
                            checkErr,
                            'useSubscription - initial check',
                            'Failed to check subscription status'
                        );
                    }
                }

                // Если не удалось получить с сервера - ищем в хранилище
                const savedStatus = await storage.get<SubscriptionStatus>(STORAGE_KEYS.SUBSCRIPTION_STATUS, true);
                if (savedStatus) {
                    logger.log(`Кэшированная подписка: ${JSON.stringify(savedStatus)}`, 'useSubscription - queryFn');
                    return savedStatus;
                }

                // Если вообще ничего не нашли - возвращаем дефолтный бесплатный статус
                logger.log(
                    `Дефолтный статус подписки: ${JSON.stringify({ tier: SUBSCRIPTION_TIERS.FREE, isActive: false })}`,
                    'useSubscription - queryFn'
                );
                return { tier: SUBSCRIPTION_TIERS.FREE, isActive: false };
            } catch (err) {
                isCheckingRef.current = false;
                return handleSubscriptionError(err, 'queryFn', setError, t);
            }
        },
        staleTime: SUBSCRIPTION_CACHE_STALE_TIME,
        enabled: !!user?.id,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
    });

    // Быстрая проверка подписки по локальным данным
    const quickCheckSubscription = useCallback(() => {
        if (!subscription)
            return {
                isPremium: false,
                isPremiumAI: false,
                tier: SUBSCRIPTION_TIERS.FREE,
            };

        const isPremiumAI = subscription.tier === SUBSCRIPTION_TIERS.PREMIUM_AI;
        const isPremium = subscription.tier === SUBSCRIPTION_TIERS.PREMIUM || isPremiumAI;

        return {
            isPremium,
            isPremiumAI,
            tier: subscription.tier,
        };
    }, [subscription]);

    // Получение доступных подписок
    const {
        data: packages,
        isLoading: isPackagesLoading,
        error: packagesError,
        refetch: refetchPackages,
    } = useQuery({
        queryKey: [QUERY_KEYS.SUBSCRIPTION, 'packages'],
        queryFn: async () => {
            try {
                logger.debug('Fetching offerings from RevenueCat', 'useSubscription – getOfferings');
                const offerings = await subscriptionService.getOfferings();

                if (!offerings || offerings.length === 0) {
                    logger.warn('No offerings returned from RevenueCat', 'useSubscription – getOfferings');
                }

                logger.log(offerings, 'useSubscription – getOfferings', 'Successfully received offerings');
                return offerings;
            } catch (err) {
                logger.error(err, 'useSubscription – getOfferings', 'Failed in getOfferings:');
                return [];
            }
        },
        staleTime: SUBSCRIPTION_CACHE_STALE_TIME,
        retry: 1,
        enabled: !!user?.id,
    });

    // Привязка пользователя к RevenueCat при первой загрузке или изменении ID
    useEffect(() => {
        if (user?.id) {
            const currentUserId = user.id.toString();

            // Используем новый метод из сервиса подписки
            subscriptionService
                .ensureUserIdSet(currentUserId)
                .then(success => {
                    if (success) {
                        logger.debug(
                            `Пользователь с ID ${currentUserId} успешно привязан к RevenueCat`,
                            'useSubscription – ensureUserIdSet'
                        );
                    } else {
                        logger.warn(
                            `Не удалось привязать пользователя с ID ${currentUserId} к RevenueCat`,
                            'useSubscription – ensureUserIdSet'
                        );
                    }
                })
                .catch(err => {
                    logger.error(err, 'useSubscription – ensureUserIdSet', 'Ошибка при привязке пользователя');
                });
        }
    }, [user?.id]);

    // Принудительное обновление подписки (вызывается только вручную)
    const forceRefreshSubscription = useCallback(async () => {
        try {
            // Проверяем, не слишком ли часто вызывается обновление
            const now = Date.now();
            if (now - lastCheckRef.current < MIN_CHECK_INTERVAL && !isCheckingRef.current) {
                logger.log('Skipping forced refresh - too frequent', 'useSubscription – forceRefreshSubscription');
                return quickCheckSubscription();
            }

            // Если проверка уже идет, ожидаем завершения
            if (isCheckingRef.current) {
                logger.log(
                    'Waiting for existing subscription check to finish',
                    'useSubscription – forceRefreshSubscription'
                );
                await new Promise(resolve => setTimeout(resolve, 500));
                return quickCheckSubscription();
            }

            isCheckingRef.current = true;
            lastCheckRef.current = now;

            logger.log('Force refreshing subscription status', 'useSubscription – forceRefreshSubscription');

            // Запрос к серверу для проверки статуса подписки
            const result = await subscriptionService.forceRefreshSubscriptionStatus();

            // Обновляем состояние подписки
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SUBSCRIPTION],
                refetchType: 'active',
            });

            isCheckingRef.current = false;
            return result;
        } catch (err) {
            isCheckingRef.current = false;
            return handleSubscriptionError(err, 'forceRefreshSubscription', setError, t);
        }
    }, [queryClient, handleSubscriptionError, setError, quickCheckSubscription]);

    // Проверка доступа к функциям
    const checkFeatureAccess = useCallback(
        (requiredTier: SubscriptionTier): boolean => {
            if (!subscription) return false;

            const tiers = {
                [SUBSCRIPTION_TIERS.FREE]: 0,
                [SUBSCRIPTION_TIERS.PREMIUM]: 1,
                [SUBSCRIPTION_TIERS.PREMIUM_AI]: 2,
            };

            const userTier = tiers[subscription.tier] || 0;
            const required = tiers[requiredTier] || 0;

            return userTier >= required;
        },
        [subscription]
    );

    // Изменяем логику для избежания вызова хуков внутри других хуков
    // Оба значения теперь вычисляются напрямую из одного и того же источника данных
    const isPremiumAI = useMemo(() => {
        return checkFeatureAccess(SUBSCRIPTION_TIERS.PREMIUM_AI);
    }, [checkFeatureAccess]);

    const isPremium = useMemo(() => {
        // Не используем isPremiumAI внутри useMemo, используем непосредственно checkFeatureAccess
        return checkFeatureAccess(SUBSCRIPTION_TIERS.PREMIUM) || checkFeatureAccess(SUBSCRIPTION_TIERS.PREMIUM_AI);
    }, [checkFeatureAccess]);

    // Мутация для покупки подписки
    const purchaseMutation = useMutation({
        mutationFn: async (pkg: PurchasesPackage) => {
            logger.log(pkg, 'useSubscription – purchaseMutation', 'Purchasing package');
            return subscriptionService.purchasePackage(pkg);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SUBSCRIPTION],
                refetchType: 'active',
            });
            setError(null);

            // Уведомляем пользователя об успешной покупке
            if (Platform.OS !== 'web') {
                Alert.alert(
                    t('screens.subscription.success.success_bought'),
                    t('screens.subscription.success.success_bought_message')
                );
            }
        },
        onError: (err: any) => {
            handleSubscriptionError(err, 'purchaseMutation', setError, t);
        },
    });

    // Мутация для восстановления покупок
    const restoreMutation = useMutation({
        mutationFn: () => {
            logger.log('Restoring purchases', 'useSubscription – restoreMutation');
            return subscriptionService.restorePurchases();
        },
        onSuccess: customerInfo => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SUBSCRIPTION],
                refetchType: 'active',
            });
            setError(null);

            // Проверяем, есть ли активные подписки
            const hasActiveSubscriptions =
                customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

            // Уведомляем пользователя о результате восстановления
            if (Platform.OS !== 'web') {
                if (hasActiveSubscriptions) {
                    Alert.alert(
                        t('screens.subscription.success.success_restored'),
                        t('screens.subscription.success.success_restored_message')
                    );
                } else {
                    Alert.alert(
                        t('screens.subscription.error.restore_empty_title'),
                        t('screens.subscription.error.restore_empty_message')
                    );
                }
            }
        },
        onError: (err: any) => {
            handleSubscriptionError(err, 'restoreMutation', setError, t);
        },
    });

    // Мутация для выхода пользователя
    const logoutMutation = useMutation({
        mutationFn: () => {
            logger.log('Logging out subscription', 'useSubscription – logoutMutation');
            return subscriptionService.logout();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SUBSCRIPTION],
                refetchType: 'active',
            });
            setError(null);
        },
        onError: (err: any) => {
            handleSubscriptionError(err, 'logoutMutation', setError, t);
        },
    });

    // Проверка активной подписки на сервере (только при явном вызове)
    const verifySubscriptionWithServer = useCallback(async () => {
        try {
            // Проверяем, не слишком ли часто вызывается проверка
            const now = Date.now();
            if (now - lastCheckRef.current < MIN_CHECK_INTERVAL) {
                logger.log(
                    'Skipping server verification - too frequent',
                    'useSubscription – verifySubscriptionWithServer'
                );
                // Получаем текущее значение напрямую из subscription, а не из isPremium (которое зависит от хука)
                const currentIsPremium =
                    subscription?.tier === SUBSCRIPTION_TIERS.PREMIUM ||
                    subscription?.tier === SUBSCRIPTION_TIERS.PREMIUM_AI ||
                    false;
                return currentIsPremium;
            }

            // Если проверка уже идет, ожидаем завершения
            if (isCheckingRef.current) {
                await new Promise(resolve => setTimeout(resolve, 500));
                // Получаем текущее значение напрямую из subscription, а не из isPremium (которое зависит от хука)
                const currentIsPremium =
                    subscription?.tier === SUBSCRIPTION_TIERS.PREMIUM ||
                    subscription?.tier === SUBSCRIPTION_TIERS.PREMIUM_AI ||
                    false;
                return currentIsPremium;
            }

            isCheckingRef.current = true;
            lastCheckRef.current = now;

            logger.log('Verifying subscription with server', 'useSubscription – verifySubscriptionWithServer');
            const isValid = await subscriptionService.verifySubscriptionWithServer();

            // Если проверка на сервере не прошла, но у нас есть локальный кэш с активной подпиской,
            // принудительно обновляем статус
            // Получаем текущее значение напрямую из subscription, а не из isPremium (которое зависит от хука)
            const currentIsPremium =
                subscription?.tier === SUBSCRIPTION_TIERS.PREMIUM ||
                subscription?.tier === SUBSCRIPTION_TIERS.PREMIUM_AI ||
                false;
            if (!isValid && currentIsPremium) {
                await forceRefreshSubscription();
            }

            isCheckingRef.current = false;
            return isValid;
        } catch (err) {
            isCheckingRef.current = false;
            handleSubscriptionError(err, 'verifySubscriptionWithServer', setError, t);
            return false;
        }
    }, [handleSubscriptionError, forceRefreshSubscription, subscription, setError]);

    // Активация премиум-плана админом (для тестирования/демо)
    const activatePlanByAdmin = useCallback(async () => {
        logger.log('Activating subscription by admin', 'useSubscription – activatePlanByAdmin');
        try {
            await cacheService.clearCache();

            // Создаем новый кэш с premium_ai статусом
            await cacheService.cacheSubscription({
                isPremium: true,
                isPremiumAI: true,
                tier: SUBSCRIPTION_TIERS.PREMIUM_AI,
            });

            // Обновляем состояние в React Query
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SUBSCRIPTION],
                refetchType: 'all',
            });

            return true;
        } catch (err) {
            handleSubscriptionError(err, 'activatePlanByAdmin', setError, t);
            return false;
        }
    }, [cacheService, queryClient, handleSubscriptionError, setError]);

    // Деактивация премиум-плана админом
    const deactivatePlanByAdmin = useCallback(async () => {
        logger.log('Deactivating subscription by admin', 'useSubscription – deactivatePlanByAdmin');
        try {
            await cacheService.clearCache();

            // Обновляем состояние в React Query
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SUBSCRIPTION],
                refetchType: 'all',
            });

            return true;
        } catch (err) {
            handleSubscriptionError(err, 'deactivatePlanByAdmin', setError, t);
            return false;
        }
    }, [cacheService, queryClient, handleSubscriptionError, setError]);

    // Полная очистка кэша подписки
    const clearSubscriptionCache = useCallback(async () => {
        logger.log('Clearing subscription cache', 'useSubscription – clearSubscriptionCache');
        try {
            await cacheService.clearCache();
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION_STATUS);

            // Обновляем состояние в React Query
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SUBSCRIPTION],
                refetchType: 'none',
            });

            return true;
        } catch (err) {
            handleSubscriptionError(err, 'clearSubscriptionCache', setError, t);
            return false;
        }
    }, [cacheService, queryClient, handleSubscriptionError, setError]);

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
        isLoggingOut: logoutMutation.isPending,

        // Статусы подписки
        isPremium,
        isPremiumAI,

        // Действия
        purchase: purchaseMutation.mutate,
        restore: restoreMutation.mutate,
        logout: logoutMutation.mutate,
        refetchSubscription,
        refetchPackages,
        forceRefreshSubscription,
        checkFeatureAccess,
        quickCheckSubscription,
        activatePlanByAdmin,
        deactivatePlanByAdmin,
        verifySubscriptionWithServer,
        clearSubscriptionCache,

        // Очистка ошибок
        clearError: () => setError(null),
    };
};
