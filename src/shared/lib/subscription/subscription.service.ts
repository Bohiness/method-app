// src/shared/lib/subscription/subscription.service.ts

import { storage } from '@shared/lib/storage/storage.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { Platform } from 'react-native';
// import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { SubscriptionCacheService } from './subscription-cache.service';

class SubscriptionService {
    private readonly REVENUECAT_KEY = Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
        // android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
    });

    private initialized = false;
    private cacheService: SubscriptionCacheService;

    constructor() {
        this.cacheService = SubscriptionCacheService.getInstance();
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            if (!this.REVENUECAT_KEY) {
                throw new Error('RevenueCat API key not configured');
            }

            await Purchases.configure({
                apiKey: this.REVENUECAT_KEY,
                useAmazon: false,
            });

            if (__DEV__) {
                Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            }

            this.initialized = true;
            console.debug('RevenueCat initialized successfully');
        } catch (error) {
            console.error('Failed to initialize RevenueCat:', error);
            throw error;
        }
    }

    async getOfferings(): Promise<PurchasesPackage[]> {
        try {
            const offerings = await Purchases.getOfferings();

            if (!offerings.current) {
                console.warn('No offerings available');
                return [];
            }

            return offerings.current.availablePackages;
        } catch (error) {
            console.error('Failed to get offerings:', error);
            throw error;
        }
    }

    async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
        try {
            const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
            await this.updateSubscriptionStatus(customerInfo);
            return customerInfo;
        } catch (error: any) {
            if (!error.userCancelled) {
                console.error('Purchase failed:', error);
            }
            throw error;
        }
    }

    async restorePurchases(): Promise<CustomerInfo> {
        try {
            const customerInfo = await Purchases.restorePurchases();
            await this.updateSubscriptionStatus(customerInfo);
            return customerInfo;
        } catch (error) {
            console.error('Failed to restore purchases:', error);
            throw error;
        }
    }

    async setUserId(userId: string): Promise<void> {
        try {
            await Purchases.logIn(userId);
        } catch (error) {
            console.error('Failed to set user ID:', error);
            throw error;
        }
    }

    private getSubscriptionTier(customerInfo: CustomerInfo): SubscriptionTier {
        if (customerInfo.activeSubscriptions.length === 0) {
            return 'free';
        }

        const activePlan = customerInfo.activeSubscriptions[0];
        if (activePlan.includes('premium_ai')) return 'premium_ai';
        if (activePlan.includes('premium')) return 'premium';

        return 'free';
    }

    private async updateSubscriptionStatus(customerInfo: CustomerInfo): Promise<SubscriptionStatus> {
        try {
            const tier = this.getSubscriptionTier(customerInfo);
            const isPremium = tier === 'premium' || tier === 'premium_ai';
            const isPremiumAI = tier === 'premium_ai';

            const status: SubscriptionStatus = {
                isActive: customerInfo.activeSubscriptions.length > 0,
                tier: tier,
                expiresAt: customerInfo.latestExpirationDate || '',
                autoRenew: customerInfo.originalPurchaseDate !== null,
                cancelAtPeriodEnd: false,
            };

            // Сохраняем в локальное хранилище
            await storage.set('subscription-status', status, true);

            // Кэшируем данные о подписке
            await this.cacheService.cacheSubscription({
                isPremium,
                isPremiumAI,
                tier,
                expirationDate: customerInfo.latestExpirationDate || undefined,
                productId: customerInfo.activeSubscriptions[0] || undefined,
            });

            return status;
        } catch (error) {
            console.error('Failed to update subscription status:', error);
            throw error;
        }
    }

    /**
     * Проверяет статус подписки, сначала из кэша, затем из RevenueCat
     */
    async checkSubscriptionStatus(): Promise<{
        isPremium: boolean;
        isPremiumAI: boolean;
        tier: SubscriptionTier;
    }> {
        try {
            // Сначала проверяем кэш
            const cachedData = await this.cacheService.getCachedSubscription();

            if (cachedData) {
                return {
                    isPremium: cachedData.isPremium,
                    isPremiumAI: cachedData.isPremiumAI,
                    tier: cachedData.tier,
                };
            }

            // Если кэша нет или он устарел, получаем данные из RevenueCat
            const customerInfo = await Purchases.getCustomerInfo();
            const status = await this.updateSubscriptionStatus(customerInfo);

            return {
                isPremium: status.tier === 'premium' || status.tier === 'premium_ai',
                isPremiumAI: status.tier === 'premium_ai',
                tier: status.tier,
            };
        } catch (error) {
            console.error('Failed to check subscription status:', error);
            // В случае ошибки возвращаем, что пользователь не премиум
            return {
                isPremium: false,
                isPremiumAI: false,
                tier: 'free',
            };
        }
    }
}

export const subscriptionService = new SubscriptionService();
