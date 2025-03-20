// src/shared/lib/subscription/subscription.service.ts

import { userApiService } from '@shared/api/user/user-api.service';
import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { SUBSCRIPTION_TIERS } from '@shared/constants/substrations/tiers';
import { storage } from '@shared/lib/storage/storage.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { Platform } from 'react-native';
// import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { logger } from '../logger/logger.service';
import { SubscriptionCacheService } from './subscription-cache.service';

// Интервал для фоновой проверки статуса подписки
const BACKGROUND_CHECK_INTERVAL = 1000 * 60 * 60; // 1 час

class SubscriptionService {
    private readonly REVENUECAT_KEY = Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
        // android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
    });

    private initialized = false;
    private cacheService: SubscriptionCacheService;
    private backgroundCheckTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.cacheService = SubscriptionCacheService.getInstance();
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            if (!this.REVENUECAT_KEY) {
                const platform = Platform.OS;
                logger.error(
                    `RevenueCat API key not configured for ${platform}`,
                    'subscription service – initialize',
                    'error'
                );
                // Не выбрасываем ошибку, а продолжаем с базовыми настройками
                this.initialized = true;
                return;
            }

            await Purchases.configure({
                apiKey: this.REVENUECAT_KEY,
                useAmazon: false,
            });

            if (__DEV__) {
                Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            }

            // Добавляем прослушивание событий подписки
            Purchases.addCustomerInfoUpdateListener(async info => {
                logger.log(info, 'subscription service – customerInfoUpdate', 'Customer info updated');
                await this.updateSubscriptionStatus(info);
            });

            // Запускаем фоновую проверку статуса подписки
            this.startBackgroundCheck();

            this.initialized = true;
            logger.debug('RevenueCat initialized successfully', 'subscription service – initialize');
        } catch (error) {
            logger.error(error, 'subscription service – initialize', 'Failed to initialize RevenueCat:');
            // Не выбрасываем ошибку, а продолжаем с базовыми настройками
            this.initialized = true;
        }
    }

    /**
     * Запускает фоновую проверку статуса подписки
     */
    private startBackgroundCheck(): void {
        // Очищаем предыдущий таймер, если он был
        if (this.backgroundCheckTimer) {
            clearInterval(this.backgroundCheckTimer);
        }

        // Устанавливаем новый таймер
        this.backgroundCheckTimer = setInterval(async () => {
            try {
                logger.debug('Background subscription check started', 'subscription service – backgroundCheck');
                await this.forceRefreshSubscriptionStatus();
            } catch (error) {
                logger.error(error, 'subscription service – backgroundCheck', 'Background check failed');
            }
        }, BACKGROUND_CHECK_INTERVAL);
    }

    async getOfferings(): Promise<PurchasesPackage[]> {
        try {
            await this.ensureInitialized();
            const offerings = await Purchases.getOfferings();

            if (!offerings.current) {
                logger.warn('No offerings available', 'subscription service – getOfferings');
                return [];
            }
            logger.log(offerings, 'subscription service – getOfferings', 'offerings');
            return offerings.current.availablePackages;
        } catch (error) {
            logger.error(error, 'subscription service – getOfferings', 'Failed to get offerings:');
            throw error;
        }
    }

    async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
        try {
            await this.ensureInitialized();
            const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
            await this.updateSubscriptionStatus(customerInfo);
            logger.log(customerInfo, 'subscription service – purchasePackage', 'customerInfo');
            return customerInfo;
        } catch (error: any) {
            if (!error.userCancelled) {
                logger.error(error, 'subscription service – purchasePackage', 'error');
            }
            throw error;
        }
    }

    async restorePurchases(): Promise<CustomerInfo> {
        try {
            await this.ensureInitialized();
            const customerInfo = await Purchases.restorePurchases();
            await this.updateSubscriptionStatus(customerInfo);
            return customerInfo;
        } catch (error) {
            logger.error(error, 'subscription service – restorePurchases', 'error');
            throw error;
        }
    }

    async setUserId(userId: string): Promise<void> {
        try {
            await this.ensureInitialized();
            await Purchases.logIn(userId);
            logger.log(userId, 'subscription service – setUserId', 'userId');
        } catch (error) {
            logger.error(error, 'subscription service – setUserId', 'error');
            throw error;
        }
    }

    private getSubscriptionTier(customerInfo: CustomerInfo): SubscriptionTier {
        logger.log(customerInfo, 'subscription service – getSubscriptionTier', 'customerInfo');
        if (!customerInfo.activeSubscriptions || customerInfo.activeSubscriptions.length === 0) {
            return SUBSCRIPTION_TIERS.FREE;
        }

        const activePlan = customerInfo.activeSubscriptions[0];
        logger.log(activePlan, 'subscription service – getSubscriptionTier', 'activePlan');
        if (activePlan.includes(SUBSCRIPTION_TIERS.PREMIUM_AI)) return SUBSCRIPTION_TIERS.PREMIUM_AI;
        if (activePlan.includes(SUBSCRIPTION_TIERS.PREMIUM)) return SUBSCRIPTION_TIERS.PREMIUM;

        return SUBSCRIPTION_TIERS.FREE;
    }

    private async updateSubscriptionStatus(customerInfo: CustomerInfo): Promise<SubscriptionStatus> {
        try {
            const tier = this.getSubscriptionTier(customerInfo);
            const isPremiumAI = tier === SUBSCRIPTION_TIERS.PREMIUM_AI;
            // isPremium будет true для любой премиум-подписки, включая premium_ai
            const isPremium = tier === SUBSCRIPTION_TIERS.PREMIUM || isPremiumAI;

            const status: SubscriptionStatus = {
                isActive: isPremium,
                tier: tier,
                expiresAt: customerInfo.latestExpirationDate || '',
                autoRenew: customerInfo.originalPurchaseDate !== null,
                cancelAtPeriodEnd: false,
            };

            // Сохраняем в локальное хранилище
            await storage.set(STORAGE_KEYS.SUBSCRIPTION_STATUS, status, true);

            // Кэшируем данные о подписке
            await this.cacheService.cacheSubscription({
                isPremium,
                isPremiumAI,
                tier,
                expirationDate: customerInfo.latestExpirationDate || undefined,
                productId:
                    customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0
                        ? customerInfo.activeSubscriptions[0]
                        : undefined,
            });

            logger.log(status, 'subscription service – updateSubscriptionStatus', 'status');
            return status;
        } catch (error) {
            logger.error(error, 'subscription service – updateSubscriptionStatus', 'error');
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
            logger.start('checkSubscriptionStatus', 'subscription service – checkSubscriptionStatus');
            // Сначала проверяем кэш
            const cachedData = await this.cacheService.getCachedSubscription();
            logger.log(cachedData, 'subscription service – checkSubscriptionStatus', 'cachedData');
            if (cachedData) {
                return {
                    isPremium: cachedData.isPremium,
                    isPremiumAI: cachedData.isPremiumAI,
                    tier: cachedData.tier,
                };
            }

            // Если кэша нет или он устарел, получаем данные из RevenueCat
            await this.ensureInitialized();
            const customerInfo = await Purchases.getCustomerInfo();
            logger.log(customerInfo, 'subscription service – checkSubscriptionStatus', 'customerInfo');
            const status = await this.updateSubscriptionStatus(customerInfo);
            logger.log(status, 'subscription service – checkSubscriptionStatus', 'status');

            const isPremiumAI = status.tier === SUBSCRIPTION_TIERS.PREMIUM_AI;
            const isPremium = status.tier === SUBSCRIPTION_TIERS.PREMIUM || isPremiumAI;

            return {
                isPremium,
                isPremiumAI,
                tier: status.tier,
            };
        } catch (error) {
            logger.error(error, 'subscription service – checkSubscriptionStatus', 'error');
            // В случае ошибки возвращаем, что пользователь не премиум
            return {
                isPremium: false,
                isPremiumAI: false,
                tier: SUBSCRIPTION_TIERS.FREE,
            };
        }
    }

    /**
     * Выход пользователя и сброс данных подписки
     */
    async logout(): Promise<void> {
        try {
            await this.ensureInitialized();
            await Purchases.logOut();
            await this.cacheService.clearCache();

            // Очищаем данные в локальном хранилище
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION_STATUS);

            logger.log('User logged out from RevenueCat', 'subscription service – logout');
        } catch (error) {
            logger.error(error, 'subscription service – logout', 'Failed to logout user:');
            throw error;
        }
    }

    /**
     * Проверяет статус подписки на сервере
     */
    async verifySubscriptionWithServer(): Promise<boolean> {
        try {
            // Запрос к серверу для проверки подписки
            const response = await userApiService.verifySubscription();
            return response.isValid;
        } catch (error) {
            logger.error(error, 'subscription service – verifySubscriptionWithServer', 'error');
            return false;
        }
    }

    /**
     * Убеждается, что сервис инициализирован
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    /**
     * Принудительное обновление статуса подписки
     */
    async forceRefreshSubscriptionStatus(): Promise<{
        isPremium: boolean;
        isPremiumAI: boolean;
        tier: SubscriptionTier;
    }> {
        try {
            // Очищаем кэш
            await this.cacheService.clearCache();

            // Запрашиваем актуальные данные из RevenueCat
            await this.ensureInitialized();
            const customerInfo = await Purchases.getCustomerInfo();
            const status = await this.updateSubscriptionStatus(customerInfo);

            const isPremiumAI = status.tier === SUBSCRIPTION_TIERS.PREMIUM_AI;
            const isPremium = status.tier === SUBSCRIPTION_TIERS.PREMIUM || isPremiumAI;

            return {
                isPremium,
                isPremiumAI,
                tier: status.tier,
            };
        } catch (error) {
            logger.error(error, 'subscription service – forceRefreshSubscriptionStatus', 'error');
            return {
                isPremium: false,
                isPremiumAI: false,
                tier: SUBSCRIPTION_TIERS.FREE,
            };
        }
    }
}

export const subscriptionService = new SubscriptionService();
