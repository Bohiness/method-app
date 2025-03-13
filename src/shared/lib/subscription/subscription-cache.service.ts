import { userApiService } from '@shared/api/user/user-api.service';
import { StorageService } from '@shared/lib/storage/storage.service';
import { SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import axios, { AxiosInstance } from 'axios';

const SUBSCRIPTION_CACHE_KEY = 'subscription_cache';
const SUBSCRIPTION_CACHE_TIMESTAMP_KEY = 'subscription_cache_timestamp';
const CACHE_EXPIRATION_TIME = 1000 * 60 * 60; // 1 час в миллисекундах

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
    private apiClient: AxiosInstance;

    private constructor() {
        this.storageService = new StorageService();
        this.apiClient = axios.create({
            baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do',
        });
    }

    public static getInstance(): SubscriptionCacheService {
        if (!SubscriptionCacheService.instance) {
            SubscriptionCacheService.instance = new SubscriptionCacheService();
        }
        return SubscriptionCacheService.instance;
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
            if (now - cachedData.timestamp > CACHE_EXPIRATION_TIME) {
                // Кэш устарел
                return null;
            }

            return cachedData;
        } catch (error) {
            console.error('Ошибка при получении кэша подписки:', error);
            return null;
        }
    }

    /**
     * Сохраняет данные о подписке в кэш
     */
    public async cacheSubscription(data: Omit<SubscriptionCacheData, 'timestamp'>): Promise<void> {
        try {
            const cacheData: SubscriptionCacheData = {
                ...data,
                timestamp: Date.now(),
            };

            await this.storageService.set(SUBSCRIPTION_CACHE_KEY, cacheData);

            // Синхронизируем с сервером
            this.syncWithServer(cacheData).catch(error => {
                console.error('Ошибка при синхронизации подписки с сервером:', error);
            });
        } catch (error) {
            console.error('Ошибка при кэшировании подписки:', error);
        }
    }

    /**
     * Очищает кэш подписки
     */
    public async clearCache(): Promise<void> {
        try {
            await this.storageService.remove(SUBSCRIPTION_CACHE_KEY);
        } catch (error) {
            console.error('Ошибка при очистке кэша подписки:', error);
        }
    }

    /**
     * Синхронизирует данные о подписке с сервером
     */
    private async syncWithServer(data: SubscriptionCacheData): Promise<void> {
        try {
            await userApiService.syncSubscription({
                isPremium: data.isPremium,
                isPremiumAI: data.isPremiumAI,
                tier: data.tier,
                expirationDate: data.expirationDate,
                productId: data.productId,
            });
        } catch (error) {
            console.error('Ошибка при синхронизации подписки с сервером:', error);
            throw error;
        }
    }
}
