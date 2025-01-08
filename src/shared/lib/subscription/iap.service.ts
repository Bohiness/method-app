// src/shared/lib/iap/iap.service.ts
import { storage } from '@shared/lib/storage/storage.service'
import { Alert, Platform } from 'react-native'
import * as StoreKit from 'react-native-iap'

// Идентификаторы продуктов из App Store Connect
export const IAP_SKUS = {
  PREMIUM_MONTHLY: 'com.yourapp.premium.monthly',
  PREMIUM_YEARLY: 'com.yourapp.premium.yearly',
  PRO_MONTHLY: 'com.yourapp.pro.monthly',
  PRO_YEARLY: 'com.yourapp.pro.yearly',
};

export type SubscriptionTier = 'free' | 'premium' | 'pro';

interface SubscriptionInfo {
  isActive: boolean;
  tier: SubscriptionTier;
  expirationDate: string | null;
  productId: string | null;
}

class IAPService {
  private isInitialized = false;
  private readonly SUBSCRIPTION_KEY = 'user-subscription';

  async initialize() {
    try {
      if (this.isInitialized) return;

      // Инициализация IAP
      await StoreKit.initConnection();
      
      // Проверяем и завершаем незавершенные транзакции
      const transactions = Platform.select({
        ios: await StoreKit.getPendingPurchasesIOS(),
        // android: await StoreKit.getPendingPurchasesAndroid(),
      }) || [];
      if (transactions.length > 0) {
        for (const transaction of transactions) {
          await this.handlePurchase(transaction);
        }
      }

      this.isInitialized = true;
      console.debug('IAP initialized successfully');

      // Добавляем слушатель для обработки покупок
      StoreKit.purchaseUpdatedListener(async (purchase) => {
        await this.handlePurchase(purchase);
      });

      // Добавляем слушатель для обработки ошибок
      StoreKit.purchaseErrorListener((error) => {
        console.error('Purchase error:', error);
        if (!error.message.includes('cancelled')) {
          Alert.alert('Error', 'Purchase failed. Please try again.');
        }
      });

    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      throw error;
    }
  }

  async getProducts() {
    try {
      await this.ensureInitialized();
      
      const skus = Object.values(IAP_SKUS);
      const products = await StoreKit.getProducts(skus);
      
      return products.map(product => ({
        ...product,
        // Добавляем дополнительную информацию о продукте
        tier: this.getTierFromProductId(product.productId),
        interval: product.productId.includes('yearly') ? 'yearly' : 'monthly'
      }));
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  async purchaseProduct(productId: string) {
    try {
      await this.ensureInitialized();
      
      // Запускаем покупку
      const result = await StoreKit.requestPurchase(productId);
      return result;
    } catch (error: any) {
      if (!error.message.includes('cancelled')) {
        console.error('Purchase failed:', error);
        throw error;
      }
    }
  }

  async restorePurchases() {
    try {
      await this.ensureInitialized();
      
      if (Platform.OS === 'ios') {
        await StoreKit.clearTransactionIOS();
      }
      
      const restored = await StoreKit.getAvailablePurchases();
      
      if (restored.length > 0) {
        // Находим самую свежую активную подписку
        const latestPurchase = restored.reduce((latest, current) => {
          return (!latest || current.transactionDate > latest.transactionDate) 
            ? current 
            : latest;
        });

        await this.handlePurchase(latestPurchase);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionInfo> {
    try {
      await this.ensureInitialized();
      
      const cached = await storage.get<SubscriptionInfo>(this.SUBSCRIPTION_KEY);
      if (cached) {
        // Проверяем, не истекла ли подписка
        if (cached.expirationDate && new Date(cached.expirationDate) > new Date()) {
          return cached;
        }
      }

      // Получаем активные покупки
      const purchases = await StoreKit.getAvailablePurchases();
      
      if (purchases.length === 0) {
        return this.getDefaultSubscriptionInfo();
      }

      // Находим самую свежую активную подписку
      const latestPurchase = purchases.reduce((latest, current) => {
        return (!latest || current.transactionDate > latest.transactionDate) 
          ? current 
          : latest;
      });

      const subscriptionInfo = {
        isActive: true,
        tier: this.getTierFromProductId(latestPurchase.productId),
        expirationDate: new Date(latestPurchase.transactionDate + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 дней
        productId: latestPurchase.productId
      };

      await storage.set(this.SUBSCRIPTION_KEY, subscriptionInfo);
      return subscriptionInfo;

    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return this.getDefaultSubscriptionInfo();
    }
  }

  private async handlePurchase(purchase: StoreKit.Purchase) {
    try {
      // Подтверждаем транзакцию
      if (Platform.OS === 'ios') {
        await StoreKit.finishTransactionIOS(purchase.transactionId);
      } else {
        await StoreKit.acknowledgePurchaseAndroid(purchase.purchaseToken);
      }

      // Сохраняем информацию о подписке
      const subscriptionInfo = {
        isActive: true,
        tier: this.getTierFromProductId(purchase.productId),
        expirationDate: new Date(purchase.transactionDate + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 дней
        productId: purchase.productId
      };

      await storage.set(this.SUBSCRIPTION_KEY, subscriptionInfo);

    } catch (error) {
      console.error('Failed to handle purchase:', error);
      throw error;
    }
  }

  private getTierFromProductId(productId: string): SubscriptionTier {
    if (productId.includes('pro')) return 'pro';
    if (productId.includes('premium')) return 'premium';
    return 'free';
  }

  private getDefaultSubscriptionInfo(): SubscriptionInfo {
    return {
      isActive: false,
      tier: 'free',
      expirationDate: null,
      productId: null
    };
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Вспомогательные методы для проверки подписки
  async isPremium(): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    return status.isActive && ['premium', 'pro'].includes(status.tier);
  }

  async isPro(): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    return status.isActive && status.tier === 'pro';
  }
}

export const iapService = new IAPService();
