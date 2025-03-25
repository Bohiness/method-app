import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { SUBSCRIPTION_TIERS } from '@shared/constants/substrations/tiers';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { SubscriptionCacheData, SubscriptionCacheService } from '@shared/lib/subscription/subscription-cache.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
// import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

/**
 * Сервис для работы с подписками RevenueCat
 */
class SubscriptionService {
    private isInitialized = false;
    private cacheService: SubscriptionCacheService;
    private currentUserId: string | null = null;

    constructor() {
        logger.debug('SubscriptionService создан');
        this.cacheService = SubscriptionCacheService.getInstance();
    }

    /**
     * Инициализация RevenueCat SDK
     */
    async initialize(): Promise<boolean> {
        try {
            if (this.isInitialized) {
                logger.debug('RevenueCat уже инициализирован', 'initialize – SubscriptionService');
                return true;
            }

            logger.debug('Инициализация RevenueCat SDK', 'initialize – SubscriptionService');

            // Включаем отладочные логи в RevenueCat
            await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

            // Получаем API ключи из переменных окружения
            const iOSKey = Constants.expoConfig?.extra?.revenuecatIosKey || process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
            const appId = Constants.expoConfig?.extra?.revenuecatId || process.env.EXPO_PUBLIC_REVENUECAT_ID;

            logger.debug(`iOS Key: ${iOSKey ? 'настроен' : 'отсутствует'}`, 'initialize – SubscriptionService');
            logger.debug(`App ID: ${appId ? appId : 'отсутствует'}`, 'initialize – SubscriptionService');

            // Настраиваем SDK в зависимости от платформы
            if (Platform.OS === 'ios') {
                if (!iOSKey) {
                    throw new Error(
                        'API ключ для iOS не настроен. Проверьте переменную окружения EXPO_PUBLIC_REVENUECAT_IOS_KEY'
                    );
                }

                logger.log(
                    `Настройка RevenueCat для iOS с ключом: ${iOSKey.substring(0, 5)}...`,
                    'initialize – SubscriptionService'
                );
                await Purchases.configure({ apiKey: iOSKey });
                logger.debug('RevenueCat настроен для iOS', 'initialize – SubscriptionService');
            } else {
                logger.warn(
                    'RevenueCat поддерживается только для iOS в данной конфигурации',
                    'initialize – SubscriptionService'
                );
                return false;
            }

            // Проверка инициализации
            try {
                // Проверяем, успешно ли инициализирован SDK, выполнив безопасный запрос
                await Purchases.getCustomerInfo();
                this.isInitialized = true;
                logger.debug('RevenueCat успешно инициализирован и проверен', 'initialize – SubscriptionService');
                return true;
            } catch (checkError) {
                logger.error(
                    checkError,
                    'initialize – SubscriptionService',
                    'Ошибка при проверке инициализации RevenueCat'
                );
                this.isInitialized = false;
                return false;
            }
        } catch (error) {
            logger.error(error, 'SubscriptionService - initialize', 'Ошибка при инициализации RevenueCat');
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Безопасный вызов метода RevenueCat с проверкой инициализации
     */
    private async ensureInitialized(): Promise<boolean> {
        if (!this.isInitialized) {
            logger.debug(
                'RevenueCat не инициализирован, пытаемся инициализировать...',
                'ensureInitialized – SubscriptionService'
            );
            return await this.initialize();
        }
        return true;
    }

    /**
     * Устанавливает ID пользователя в RevenueCat
     */
    async setUserId(userId: string): Promise<void> {
        try {
            logger.debug(`Попытка установить ID пользователя: ${userId}`, 'setUserId – SubscriptionService');

            // Проверяем, не установлен ли уже этот ID
            if (this.currentUserId === userId) {
                logger.debug(
                    `Пользователь с ID ${userId} уже установлен в RevenueCat`,
                    'setUserId – SubscriptionService'
                );
                return;
            }

            if (!(await this.ensureInitialized())) {
                logger.error(
                    'Не удалось инициализировать RevenueCat для установки ID пользователя',
                    'setUserId – SubscriptionService'
                );
                throw new Error('Не удалось инициализировать RevenueCat для установки ID пользователя');
            }

            logger.debug(`Вызов Purchases.logIn с ID: ${userId}`, 'setUserId – SubscriptionService');
            await Purchases.logIn(userId);

            // Сохраняем ID пользователя после успешной установки
            this.currentUserId = userId;

            logger.debug('ID пользователя успешно установлен', 'setUserId – SubscriptionService');
        } catch (error) {
            logger.error(error, 'SubscriptionService - setUserId', 'Ошибка при установке ID пользователя');
            throw error;
        }
    }

    /**
     * Проверяет, нужно ли устанавливать ID пользователя, и устанавливает его если нужно
     * @param userId ID пользователя для проверки и установки
     * @returns true если ID был установлен или уже был установлен ранее, false если произошла ошибка
     */
    async ensureUserIdSet(userId: string): Promise<boolean> {
        logger.debug(`Проверка и установка ID пользователя: ${userId}`, 'ensureUserIdSet – SubscriptionService');
        try {
            // Проверяем, нужно ли устанавливать ID
            if (this.currentUserId === userId) {
                logger.debug(
                    `Пользователь с ID ${userId} уже установлен в RevenueCat`,
                    'ensureUserIdSet – SubscriptionService'
                );
                return true;
            }

            // Устанавливаем ID пользователя
            await this.setUserId(userId);
            logger.debug(`ID пользователя ${userId} успешно установлен`, 'ensureUserIdSet – SubscriptionService');
            return true;
        } catch (error) {
            logger.error(error, 'ensureUserIdSet – SubscriptionService', 'Ошибка при установке ID пользователя');
            return false;
        }
    }

    /**
     * Получает текущий ID пользователя, установленный в RevenueCat
     */
    getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    /**
     * Получает список доступных пакетов подписок
     */
    async getOfferings(): Promise<PurchasesPackage[]> {
        try {
            logger.debug('Получение списка доступных подписок', 'getOfferings – SubscriptionService');

            if (!(await this.ensureInitialized())) {
                throw new Error('Не удалось инициализировать RevenueCat для получения подписок');
            }

            const offerings = await Purchases.getOfferings();

            if (!offerings || !offerings.current) {
                logger.warn(
                    'Результат запроса offerings получен, но current отсутствует',
                    'getOfferings – SubscriptionService'
                );
                return [];
            }

            if (!offerings.current.availablePackages) {
                logger.warn('Нет доступных пакетов подписок в offerings.current', 'getOfferings – SubscriptionService');
                return [];
            }

            logger.debug(`Получено ${offerings.current.availablePackages.length} пакетов подписок`);

            logger.json(offerings.current.availablePackages, {
                title: 'Список доступных пакетов подписок',
                context: 'getOfferings – SubscriptionService',
            });

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

            logger.debug(`Покупка пакета: ${pkg.identifier}`, 'purchasePackage – SubscriptionService');
            const { customerInfo } = await Purchases.purchasePackage(pkg);

            // Обновляем статус подписки в хранилище
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug('Пакет успешно куплен', 'purchasePackage – SubscriptionService');
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

            logger.debug('Восстановление покупок', 'restorePurchases – SubscriptionService');
            const customerInfo = await Purchases.restorePurchases();

            // Обновляем статус подписки в хранилище
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug('Покупки успешно восстановлены', 'restorePurchases – SubscriptionService');
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

            logger.debug('Проверка статуса подписки', 'checkSubscriptionStatus – SubscriptionService');
            // Сначала проверяем кеш
            const cachedSubscription = await this.cacheService.getCachedSubscription();
            if (cachedSubscription) {
                logger.debug(
                    'Использование кешированного статуса подписки',
                    'checkSubscriptionStatus – SubscriptionService'
                );
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

            logger.debug(
                'Принудительное обновление статуса подписки',
                'forceRefreshSubscriptionStatus – SubscriptionService'
            );
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
                logger.debug('RevenueCat не инициализирован, выход не требуется', 'logout – SubscriptionService');
                return;
            }

            logger.debug('Выход пользователя из RevenueCat', 'logout – SubscriptionService');
            await Purchases.logOut();
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION_STATUS);
            // Очищаем кеш при выходе
            await this.cacheService.clearCache();
            logger.debug('Пользователь успешно вышел из RevenueCat', 'logout – SubscriptionService');
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

            logger.debug('Проверка подписки на сервере', 'verifySubscriptionWithServer – SubscriptionService');

            // Получаем текущую информацию о клиенте
            // Исправляем вызов метода, не используя параметр fetchPolicy
            const customerInfo = await Purchases.getCustomerInfo();

            // Проверяем наличие активных подписок
            const hasActiveSubscriptions =
                customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0;

            // Обновляем локальный статус подписки
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug(
                `Проверка на сервере завершена. Результат: ${hasActiveSubscriptions}`,
                'verifySubscriptionWithServer – SubscriptionService'
            );
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
            logger.debug('Деактивация админ-плана', 'deactivatePremiumPlanForAdmin – SubscriptionService');

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

            logger.debug('Админ-план успешно деактивирован', 'deactivatePremiumPlanForAdmin – SubscriptionService');
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
            logger.debug('Очистка всех кешей подписки', 'clearSubscriptionCache – SubscriptionService');

            // Очищаем кеш в сервисе кеширования
            await this.cacheService.clearCache();

            // Очищаем локальное хранилище
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION_STATUS);

            logger.debug('Кеш подписки успешно очищен', 'clearSubscriptionCache – SubscriptionService');
            return true;
        } catch (error) {
            logger.error(error, 'SubscriptionService - clearSubscriptionCache', 'Ошибка при очистке кеша подписки');
            return false;
        }
    }
}

export const subscriptionService = new SubscriptionService();
