import { StorageService } from '@shared/lib/storage/storage.service';
import { SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { logger } from '../logger/logger.service';

const SUBSCRIPTION_CACHE_KEY = 'subscription_cache';

export interface SubscriptionCacheData {
    isPremium: boolean;
    isPremiumAI: boolean;
    tier: SubscriptionTier;
    expirationDate?: string;
    productId?: string;
    timestamp: number;
}

export class SubscriptionCacheService {
    private static instance: SubscriptionCacheService;
    private storageService: StorageService;
    // Делаем время кэша настраиваемым
    private cacheExpirationTime: number = 1000 * 60 * 60 * 24;

    private constructor() {
        this.storageService = new StorageService();
    }

    public static getInstance(): SubscriptionCacheService {
        if (!SubscriptionCacheService.instance) {
            SubscriptionCacheService.instance = new SubscriptionCacheService();
        }
        return SubscriptionCacheService.instance;
    }

    /**
     * Настраивает время жизни кэша в миллисекундах
     */
    public setCacheExpirationTime(milliseconds: number): void {
        if (milliseconds <= 0) {
            logger.warn(
                'Invalid cache expiration time, must be greater than 0. Using default.',
                'subscription cache service – setCacheExpirationTime'
            );
            return;
        }

        this.cacheExpirationTime = milliseconds;
        logger.log(
            { cacheExpirationTime: this.cacheExpirationTime },
            'subscription cache service – setCacheExpirationTime'
        );
    }

    /**
     * Получает данные о подписке из кэша
     */
    public async getCachedSubscription(): Promise<SubscriptionCacheData | null> {
        try {
            const cachedData = await this.storageService.get<SubscriptionCacheData>(SUBSCRIPTION_CACHE_KEY);

            if (!cachedData) {
                return null;
            }

            const now = Date.now();
            if (now - cachedData.timestamp > this.cacheExpirationTime) {
                // Кэш устарел
                logger.log('Subscription cache expired', 'subscription cache service – getCachedSubscription');
                return null;
            }

            // Проверяем, не истекла ли сама подписка, если есть дата истечения
            if (cachedData.expirationDate) {
                const expirationDate = new Date(cachedData.expirationDate).getTime();
                if (now > expirationDate) {
                    logger.log('Subscription has expired', 'subscription cache service – getCachedSubscription');
                    // Очищаем кэш т.к. подписка истекла
                    await this.clearCache();
                    return null;
                }
            }

            // Убедимся, что isPremium включает в себя isPremiumAI
            if (cachedData.isPremiumAI && !cachedData.isPremium) {
                cachedData.isPremium = true;
            }

            return cachedData;
        } catch (error) {
            logger.error(error, 'subscription cache service – getCachedSubscription', 'error');
            return null;
        }
    }

    /**
     * Сохраняет данные о подписке в кэш
     */
    public async cacheSubscription(data: Omit<SubscriptionCacheData, 'timestamp'>): Promise<void> {
        try {
            // Валидация данных
            if (data.tier === undefined) {
                logger.error(
                    'Invalid subscription data: tier is required',
                    'subscription cache service – cacheSubscription'
                );
                return;
            }

            // Убедимся, что isPremium включает в себя isPremiumAI
            const isPremium = data.isPremium || data.isPremiumAI;

            const cacheData: SubscriptionCacheData = {
                ...data,
                isPremium,
                timestamp: Date.now(),
            };

            // 1. Сохраняем данные ЛОКАЛЬНО в AsyncStorage
            await this.storageService.set(SUBSCRIPTION_CACHE_KEY, cacheData);
            logger.log(cacheData, 'subscription cache service – cacheSubscription', 'cached subscription data');
        } catch (error) {
            // Эта ошибка относится к проблемам с ЛОКАЛЬНЫМ сохранением
            logger.error(error, 'subscription cache service – cacheSubscription', 'error saving cache locally');
        }
    }

    /**
     * Очищает кэш подписки
     */
    public async clearCache(): Promise<void> {
        try {
            await this.storageService.remove(SUBSCRIPTION_CACHE_KEY);
            logger.log('Subscription cache cleared', 'subscription cache service – clearCache');
        } catch (error) {
            logger.error(error, 'subscription cache service – clearCache', 'error');
        }
    }

    /**
     * Принудительно обновляет кэш подписки
     */
    public async forceRefresh(): Promise<void> {
        try {
            // Сначала очищаем кэш
            await this.clearCache();
            logger.log('Force refreshing subscription cache', 'subscription cache service – forceRefresh');
        } catch (error) {
            logger.error(error, 'subscription cache service – forceRefresh', 'error');
        }
    }

    /**
     * Проверяет, истек ли срок подписки
     */
    public async isSubscriptionExpired(): Promise<boolean> {
        try {
            const cachedData = await this.getCachedSubscription();

            if (!cachedData || !cachedData.isPremium) {
                return true;
            }

            if (!cachedData.expirationDate) {
                // Если дата истечения не указана, но подписка активна, считаем её действующей
                return false;
            }

            const now = Date.now();
            const expirationDate = new Date(cachedData.expirationDate).getTime();
            return now > expirationDate;
        } catch (error) {
            logger.error(error, 'subscription cache service – isSubscriptionExpired', 'error');
            // В случае ошибки считаем, что подписка истекла
            return true;
        }
    }

    /**
     * Получает время до истечения подписки в миллисекундах
     * @returns Время в миллисекундах или null, если подписка истекла или нет данных
     */
    public async getTimeUntilExpiration(): Promise<number | null> {
        try {
            const cachedData = await this.getCachedSubscription();

            if (!cachedData || !cachedData.isPremium || !cachedData.expirationDate) {
                return null;
            }

            const now = Date.now();
            const expirationDate = new Date(cachedData.expirationDate).getTime();

            if (now > expirationDate) {
                return null;
            }

            return expirationDate - now;
        } catch (error) {
            logger.error(error, 'subscription cache service – getTimeUntilExpiration', 'error');
            return null;
        }
    }
}
