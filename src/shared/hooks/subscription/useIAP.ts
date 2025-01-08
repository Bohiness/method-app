// src/shared/hooks/subscription/useIAP.ts
import { IAP_SKUS, iapService } from '@shared/lib/subscription/iap.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

export const useIAP = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация IAP
  useEffect(() => {
    const initialize = async () => {
      try {
        await iapService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('IAP initialization failed:', error);
      }
    };
    initialize();
  }, []);

  // Получение доступных продуктов
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['iap-products'],
    queryFn: () => iapService.getProducts(),
    enabled: isInitialized,
  });

  // Получение статуса подписки
  const { data: subscriptionStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => iapService.getSubscriptionStatus(),
    enabled: isInitialized,
    refetchInterval: 1000 * 60 * 5, // Проверяем каждые 5 минут
  });

  // Покупка продукта
  const { mutate: purchaseProduct, isLoading: isPurchasing } = useMutation({
    mutationFn: (productId: string) => iapService.purchaseProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      Alert.alert(
        t('subscription.success_title'),
        t('subscription.success_message')
      );
    },
    onError: (error: any) => {
      if (!error.message?.includes('cancelled')) {
        Alert.alert(
          t('subscription.error_title'),
          t('subscription.error_message')
        );
      }
    },
  });

  // Восстановление покупок
  const { mutate: restorePurchases, isLoading: isRestoring } = useMutation({
    mutationFn: () => iapService.restorePurchases(),
    onSuccess: (restored) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      if (restored) {
        Alert.alert(
          t('subscription.restore_success_title'),
          t('subscription.restore_success_message')
        );
      } else {
        Alert.alert(
          t('subscription.restore_empty_title'),
          t('subscription.restore_empty_message')
        );
      }
    },
    onError: () => {
      Alert.alert(
        t('subscription.restore_error_title'),
        t('subscription.restore_error_message')
      );
    },
  });

  // Вспомогательные функции для проверки статуса подписки
  const isPremium = subscriptionStatus?.tier === 'premium' || subscriptionStatus?.tier === 'pro';
  const isPro = subscriptionStatus?.tier === 'pro';

  // Получение группированных продуктов по типу подписки
  const groupedProducts = {
    premium: products?.filter(p => p.tier === 'premium') || [],
    pro: products?.filter(p => p.tier === 'pro') || []
  };

  return {
    // Основные данные
    products,
    groupedProducts,
    subscriptionStatus,
    
    // Действия
    purchaseProduct,
    restorePurchases,
    
    // Состояния
    isInitialized,
    isLoading: isLoadingProducts || isLoadingStatus,
    isPurchasing,
    isRestoring,
    
    // Статусы подписки
    isPremium,
    isPro,
    
    // Константы
    IAP_SKUS
  };
};