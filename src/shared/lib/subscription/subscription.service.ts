import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { SUBSCRIPTION_TIERS } from '@shared/constants/substrations/tiers';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { SubscriptionCacheData, SubscriptionCacheService } from '@shared/lib/subscription/subscription-cache.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import { Platform } from 'react-native';
// import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

/**
 * Сервис для работы с подписками RevenueCat
 */
class SubscriptionService {
    private isInitialized = false;
    private cacheService: SubscriptionCacheService;

    constructor() {
        logger.debug('SubscriptionService создан');
        this.cacheService = SubscriptionCacheService.getInstance();
    }

    /**
     * Инициализация RevenueCat SDK
     */
    async initialize(): Promise<void> {
        try {
            if (this.isInitialized) {
                logger.debug('RevenueCat уже инициализирован');
                return;
            }

            logger.debug('Инициализация RevenueCat SDK');

            // Включаем отладочные логи в RevenueCat
            await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

            // Получаем API ключи из переменных окружения
            const iOSKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
            const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
            const appId = process.env.EXPO_PUBLIC_REVENUECAT_ID;

            if (!iOSKey || !androidKey) {
                throw new Error('API ключи RevenueCat не настроены');
            }

            // Настраиваем SDK в зависимости от платформы
            if (Platform.OS === 'ios') {
                await Purchases.configure({ apiKey: iOSKey });
                logger.debug('RevenueCat настроен для iOS');
            } else if (Platform.OS === 'android') {
                await Purchases.configure({ apiKey: androidKey });
                logger.debug('RevenueCat настроен для Android');
            } else {
                logger.warn('RevenueCat не поддерживается на этой платформе');
                return;
            }

            this.isInitialized = true;
            logger.debug('RevenueCat успешно инициализирован');
        } catch (error) {
            logger.error(error, 'SubscriptionService - initialize', 'Ошибка при инициализации RevenueCat');
            throw error;
        }
    }

    /**
     * Устанавливает ID пользователя в RevenueCat
     */
    async setUserId(userId: string): Promise<void> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            logger.debug(`Установка ID пользователя: ${userId}`);
            await Purchases.logIn(userId);
            logger.debug('ID пользователя успешно установлен');
        } catch (error) {
            logger.error(error, 'SubscriptionService - setUserId', 'Ошибка при установке ID пользователя');
            throw error;
        }
    }

    /**
     * Получает список доступных пакетов подписок
     */
    async getOfferings(): Promise<PurchasesPackage[]> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            logger.debug('Получение списка доступных подписок');
            const offerings = await Purchases.getOfferings();

            if (!offerings.current || !offerings.current.availablePackages) {
                logger.warn('Нет доступных пакетов подписок');
                return [];
            }

            logger.debug(`Получено ${offerings.current.availablePackages.length} пакетов подписок`);
            return offerings.current.availablePackages;
        } catch (error) {
            logger.error(error, 'SubscriptionService - getOfferings', 'Ошибка при получении списка подписок');
            throw error;
        }
    }

    /**
     * Покупка пакета подписки
     */
    async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            logger.debug(`Покупка пакета: ${pkg.identifier}`);
            const { customerInfo } = await Purchases.purchasePackage(pkg);

            // Обновляем статус подписки в хранилище
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug('Пакет успешно куплен');
            return customerInfo;
        } catch (error) {
            logger.error(error, 'SubscriptionService - purchasePackage', 'Ошибка при покупке пакета');
            throw error;
        }
    }

    /**
     * Восстановление покупок
     */
    async restorePurchases(): Promise<CustomerInfo> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            logger.debug('Восстановление покупок');
            const customerInfo = await Purchases.restorePurchases();

            // Обновляем статус подписки в хранилище
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug('Покупки успешно восстановлены');
            return customerInfo;
        } catch (error) {
            logger.error(error, 'SubscriptionService - restorePurchases', 'Ошибка при восстановлении покупок');
            throw error;
        }
    }

    /**
     * Проверка статуса подписки
     */
    async checkSubscriptionStatus(): Promise<SubscriptionStatus | null> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            logger.debug('Проверка статуса подписки');
            // Сначала проверяем кеш
            const cachedSubscription = await this.cacheService.getCachedSubscription();
            if (cachedSubscription) {
                logger.debug('Использование кешированного статуса подписки');
                return this.mapCacheDataToSubscriptionStatus(cachedSubscription);
            }

            // Если нет в кеше, делаем запрос к RevenueCat
            const customerInfo = await Purchases.getCustomerInfo();
            return this.updateSubscriptionStatusFromCustomerInfo(customerInfo);
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - checkSubscriptionStatus',
                'Ошибка при проверке статуса подписки'
            );
            throw error;
        }
    }

    /**
     * Принудительное обновление статуса подписки
     */
    async forceRefreshSubscriptionStatus(): Promise<SubscriptionStatus | null> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            logger.debug('Принудительное обновление статуса подписки');
            await Purchases.syncPurchases();
            // Исправляем вызов метода, не используя параметр fetchPolicy
            const customerInfo = await Purchases.getCustomerInfo();
            // Очищаем кеш перед обновлением
            await this.cacheService.clearCache();
            return this.updateSubscriptionStatusFromCustomerInfo(customerInfo);
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - forceRefreshSubscriptionStatus',
                'Ошибка при обновлении статуса подписки'
            );
            throw error;
        }
    }

    /**
     * Выход пользователя
     */
    async logout(): Promise<void> {
        try {
            if (!this.isInitialized) {
                logger.debug('RevenueCat не инициализирован, выход не требуется');
                return;
            }

            logger.debug('Выход пользователя из RevenueCat');
            await Purchases.logOut();
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION_STATUS);
            // Очищаем кеш при выходе
            await this.cacheService.clearCache();
            logger.debug('Пользователь успешно вышел из RevenueCat');
        } catch (error) {
            logger.error(error, 'SubscriptionService - logout', 'Ошибка при выходе пользователя');
            throw error;
        }
    }

    /**
     * Проверка подписки на сервере
     */
    async verifySubscriptionWithServer(): Promise<boolean> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            logger.debug('Проверка подписки на сервере');

            // Получаем текущую информацию о клиенте
            // Исправляем вызов метода, не используя параметр fetchPolicy
            const customerInfo = await Purchases.getCustomerInfo();

            // Проверяем наличие активных подписок
            const hasActiveSubscriptions =
                customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

            // Обновляем локальный статус подписки
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug(`Проверка на сервере завершена. Результат: ${hasActiveSubscriptions}`);
            return hasActiveSubscriptions;
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - verifySubscriptionWithServer',
                'Ошибка при проверке подписки на сервере'
            );
            throw error;
        }
    }

    /**
     * Преобразует данные из кеша в формат SubscriptionStatus
     */
    private mapCacheDataToSubscriptionStatus(cacheData: SubscriptionCacheData): SubscriptionStatus {
        return {
            tier: cacheData.tier,
            isActive: cacheData.isPremium || cacheData.isPremiumAI,
            expiresAt: cacheData.expirationDate || '',
            autoRenew: true, // Предполагаем автоматическое продление по умолчанию
            cancelAtPeriodEnd: false, // Предполагаем, что не будет отменено в конце периода
        };
    }

    /**
     * Обновляет статус подписки на основе информации о клиенте
     * и сохраняет его в хранилище
     */
    private async updateSubscriptionStatusFromCustomerInfo(customerInfo: CustomerInfo): Promise<SubscriptionStatus> {
        try {
            const hasActiveSubscriptions =
                customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

            // Определяем уровень подписки на основе активных подписок
            let tier: SubscriptionTier = SUBSCRIPTION_TIERS.FREE;

            if (hasActiveSubscriptions) {
                // Проверяем конкретные уровни подписки
                // Названия продуктов могут отличаться в зависимости от вашей настройки в RevenueCat
                const hasPremiumAI = customerInfo.activeSubscriptions.some(
                    sub => sub.includes('premium_ai') || sub.includes('premium_plus')
                );

                const hasPremium = customerInfo.activeSubscriptions.some(
                    sub => sub.includes('premium') || sub.includes('pro')
                );

                if (hasPremiumAI) {
                    tier = SUBSCRIPTION_TIERS.PREMIUM_AI;
                } else if (hasPremium) {
                    tier = SUBSCRIPTION_TIERS.PREMIUM;
                }
            }

            // Получаем информацию об истечении подписки, если она доступна
            let expiresAtDate: Date | null = null;
            let expiresAt: string = '';
            let autoRenew = true;
            let cancelAtPeriodEnd = false;

            if (customerInfo.allExpirationDates && Object.keys(customerInfo.allExpirationDates).length > 0) {
                // Берем первую дату истечения из всех доступных
                const firstExpirationKey = Object.keys(customerInfo.allExpirationDates)[0];
                const expirationString = customerInfo.allExpirationDates[firstExpirationKey];
                if (expirationString) {
                    expiresAtDate = new Date(expirationString);
                    expiresAt = expirationString;
                }
            }

            // Проверяем, будет ли подписка автоматически продлена
            // RevenueCat SDK может не иметь autoRenewStatus в типах, но он существует в реальном объекте
            const customerInfoAny = customerInfo as any;
            if (customerInfoAny.autoRenewStatus && Object.keys(customerInfoAny.autoRenewStatus).length > 0) {
                // Берем статус автопродления для первой подписки
                const firstRenewKey = Object.keys(customerInfoAny.autoRenewStatus)[0];
                autoRenew = !!customerInfoAny.autoRenewStatus[firstRenewKey];
                cancelAtPeriodEnd = !autoRenew;
            }

            // Формируем статус подписки
            const subscriptionStatus: SubscriptionStatus = {
                tier,
                isActive: hasActiveSubscriptions,
                expiresAt,
                autoRenew,
                cancelAtPeriodEnd,
            };

            // Сохраняем в хранилище
            await storage.set(STORAGE_KEYS.SUBSCRIPTION_STATUS, subscriptionStatus, true);

            // Кешируем данные о подписке
            const productId =
                customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0
                    ? customerInfo.activeSubscriptions[0]
                    : undefined;

            await this.cacheService.cacheSubscription({
                isPremium: tier === SUBSCRIPTION_TIERS.PREMIUM || tier === SUBSCRIPTION_TIERS.PREMIUM_AI,
                isPremiumAI: tier === SUBSCRIPTION_TIERS.PREMIUM_AI,
                tier,
                expirationDate: expiresAt || undefined,
                productId,
            });

            logger.debug(`Статус подписки обновлен: ${JSON.stringify(subscriptionStatus)}`);
            return subscriptionStatus;
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - updateSubscriptionStatusFromCustomerInfo',
                'Ошибка при обновлении статуса подписки'
            );
            throw error;
        }
    }

    /**
     * Активирует премиум-план для тестирования (только для администраторов)
     */
    async activatePremiumPlanForAdmin(tier: SubscriptionTier = SUBSCRIPTION_TIERS.PREMIUM_AI): Promise<boolean> {
        try {
            logger.debug(`Активация ${tier} плана для администратора`);

            // Очищаем существующий кеш
            await this.cacheService.clearCache();

            // Создаем тестовую подписку
            const fakeExpirationDate = new Date();
            fakeExpirationDate.setFullYear(fakeExpirationDate.getFullYear() + 1); // 1 год

            // Определяем статус премиума
            const isPremium = tier === SUBSCRIPTION_TIERS.PREMIUM || tier === SUBSCRIPTION_TIERS.PREMIUM_AI;
            const isPremiumAI = tier === SUBSCRIPTION_TIERS.PREMIUM_AI;

            // Кешируем фейковую подписку
            await this.cacheService.cacheSubscription({
                isPremium,
                isPremiumAI,
                tier,
                expirationDate: fakeExpirationDate.toISOString(),
                productId: `admin_test_${tier}`,
            });

            // Обновляем локальное хранилище
            const subscriptionStatus: SubscriptionStatus = {
                tier,
                isActive: true,
                expiresAt: fakeExpirationDate.toISOString(),
                autoRenew: true,
                cancelAtPeriodEnd: false,
            };

            await storage.set(STORAGE_KEYS.SUBSCRIPTION_STATUS, subscriptionStatus, true);

            logger.debug(`Админ-план ${tier} успешно активирован`);
            return true;
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - activatePremiumPlanForAdmin',
                'Ошибка при активации админ-плана'
            );
            return false;
        }
    }

    /**
     * Деактивирует премиум-план (для администраторов)
     */
    async deactivatePremiumPlanForAdmin(): Promise<boolean> {
        try {
            logger.debug('Деактивация админ-плана');

            // Очищаем кеш
            await this.cacheService.clearCache();

            // Создаем бесплатную подписку
            const freeSubscriptionStatus: SubscriptionStatus = {
                tier: SUBSCRIPTION_TIERS.FREE,
                isActive: false,
                expiresAt: '',
                autoRenew: false,
                cancelAtPeriodEnd: false,
            };

            // Обновляем локальное хранилище
            await storage.set(STORAGE_KEYS.SUBSCRIPTION_STATUS, freeSubscriptionStatus, true);

            logger.debug('Админ-план успешно деактивирован');
            return true;
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - deactivatePremiumPlanForAdmin',
                'Ошибка при деактивации админ-плана'
            );
            return false;
        }
    }

    /**
     * Полная очистка кеша подписки (для отладки)
     */
    async clearSubscriptionCache(): Promise<boolean> {
        try {
            logger.debug('Очистка всех кешей подписки');

            // Очищаем кеш в сервисе кеширования
            await this.cacheService.clearCache();

            // Очищаем локальное хранилище
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION_STATUS);

            logger.debug('Кеш подписки успешно очищен');
            return true;
        } catch (error) {
            logger.error(error, 'SubscriptionService - clearSubscriptionCache', 'Ошибка при очистке кеша подписки');
            return false;
        }
    }
}

export const subscriptionService = new SubscriptionService();
