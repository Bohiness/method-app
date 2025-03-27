import { Platform } from 'react-native';
// Импортируем только типы статически
import { SUBSCRIPTION_TIERS } from '@shared/constants/substrations/tiers';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { SubscriptionCacheData, SubscriptionCacheService } from '@shared/lib/subscription/subscription-cache.service';
import { SubscriptionStatus, SubscriptionTier } from '@shared/types/subscription/SubscriptionType';
import Constants from 'expo-constants';
import type { CustomerInfo as RNCustomerInfo, PurchasesPackage as RNPurchasesPackage } from 'react-native-purchases';

// Объявляем переменные для модуля и типов
let Purchases: typeof import('react-native-purchases').default | null = null;
// Переименовываем импортированные типы, чтобы избежать конфликта имен
type CustomerInfo = RNCustomerInfo;
type PurchasesPackage = RNPurchasesPackage;

// Динамически загружаем модуль только не в DEV режиме
if (!__DEV__) {
    try {
        // Используем require для динамической загрузки
        const RNPurchases = require('react-native-purchases');
        Purchases = RNPurchases.default; // Убедитесь, что это правильный экспорт (может быть просто RNPurchases)
        logger.debug('Модуль react-native-purchases успешно загружен.');
    } catch (error) {
        logger.error(
            error,
            'SubscriptionService',
            "Не удалось загрузить модуль 'react-native-purchases'. Возможно, он не установлен или не настроен для текущей платформы."
        );
        // Purchases останется null
    }
} else {
    logger.warn("Режим разработки (__DEV__ === true). Модуль 'react-native-purchases' не будет загружен.");
}

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
        // Проверяем, загружен ли модуль
        if (!Purchases) {
            logger.warn('Модуль Purchases не доступен. Инициализация невозможна.', 'initialize – SubscriptionService');
            return false;
        }

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
                // Не считаем это ошибкой инициализации, просто SDK не будет работать
                return false; // Возвращаем false, так как для других платформ не настроено
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
        // Добавляем проверку на наличие Purchases
        if (!Purchases) {
            logger.warn('Модуль Purchases не доступен.', 'ensureInitialized – SubscriptionService');
            return false;
        }
        if (!this.isInitialized) {
            logger.debug(
                'RevenueCat не инициализирован, пытаемся инициализировать...',
                'ensureInitialized – SubscriptionService'
            );
            // Инициализация может провалиться если Purchases недоступен, initialize обработает это
            return await this.initialize();
        }
        return true;
    }

    /**
     * Устанавливает ID пользователя в RevenueCat
     */
    async setUserId(userId: string): Promise<void> {
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn(
                'Модуль Purchases не доступен. Установка ID пользователя невозможна.',
                'setUserId – SubscriptionService'
            );
            throw new Error('Purchases module is not available');
        }

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
            throw error; // Пробрасываем ошибку дальше
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
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn(
                'Модуль Purchases не доступен. Получение подписок невозможно.',
                'getOfferings – SubscriptionService'
            );
            // Возвращаем пустой массив или можно бросить ошибку
            return [];
        }
        try {
            logger.debug('Получение списка доступных подписок', 'getOfferings – SubscriptionService');

            if (!(await this.ensureInitialized())) {
                // ensureInitialized уже вернет false если Purchases нет, но дублируем лог для ясности
                logger.error(
                    'Не удалось инициализировать RevenueCat для получения подписок',
                    'getOfferings – SubscriptionService'
                );
                return []; // Возвращаем пустой массив при ошибке инициализации
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

            // Убедимся, что возвращаемый тип соответствует RNPurchasesPackage[]
            return offerings.current.availablePackages as PurchasesPackage[];
        } catch (error) {
            logger.error(error, 'SubscriptionService - getOfferings', 'Ошибка при получении списка подписок');
            // Возвращаем пустой массив при ошибке
            return [];
        }
    }

    /**
     * Покупка пакета подписки
     */
    async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn('Модуль Purchases не доступен. Покупка невозможна.', 'purchasePackage – SubscriptionService');
            throw new Error('Purchases module is not available');
        }
        try {
            // ensureInitialized вызывается неявно через purchasePackage, но лучше явно
            if (!(await this.ensureInitialized())) {
                logger.error(
                    'Не удалось инициализировать RevenueCat для покупки пакета',
                    'purchasePackage – SubscriptionService'
                );
                throw new Error('Failed to initialize RevenueCat for purchase');
            }

            logger.debug(`Покупка пакета: ${pkg.identifier}`, 'purchasePackage – SubscriptionService');
            // Убедимся, что pkg имеет тип RNPurchasesPackage перед передачей
            const { customerInfo } = await Purchases.purchasePackage(pkg as RNPurchasesPackage);

            // Обновляем статус подписки в хранилище
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug('Пакет успешно куплен', 'purchasePackage – SubscriptionService');
            return customerInfo as CustomerInfo;
        } catch (error: any) {
            // Явно типизируем ошибку
            // RevenueCat может возвращать специфичные коды ошибок при отмене пользователем
            if (error.code === '1') {
                // '1' - Purchase cancelled error code
                logger.warn('Покупка отменена пользователем.', 'purchasePackage – SubscriptionService');
                // Не пробрасываем ошибку дальше, если это отмена пользователем
                // Можно вернуть null или специальный объект, чтобы UI понял причину
                // Пока просто пробросим для совместимости
                throw error;
            } else {
                logger.error(error, 'SubscriptionService - purchasePackage', 'Ошибка при покупке пакета');
                throw error; // Пробрасываем другие ошибки
            }
        }
    }

    /**
     * Восстановление покупок
     */
    async restorePurchases(): Promise<CustomerInfo> {
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn(
                'Модуль Purchases не доступен. Восстановление покупок невозможно.',
                'restorePurchases – SubscriptionService'
            );
            throw new Error('Purchases module is not available');
        }
        try {
            if (!(await this.ensureInitialized())) {
                logger.error(
                    'Не удалось инициализировать RevenueCat для восстановления покупок',
                    'restorePurchases – SubscriptionService'
                );
                throw new Error('Failed to initialize RevenueCat for restore');
            }

            logger.debug('Восстановление покупок', 'restorePurchases – SubscriptionService');
            const customerInfo = await Purchases.restorePurchases();

            // Обновляем статус подписки в хранилище
            await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            logger.debug('Покупки успешно восстановлены', 'restorePurchases – SubscriptionService');
            return customerInfo as CustomerInfo;
        } catch (error) {
            logger.error(error, 'SubscriptionService - restorePurchases', 'Ошибка при восстановлении покупок');
            throw error;
        }
    }

    /**
     * Проверка статуса подписки
     */
    async checkSubscriptionStatus(): Promise<SubscriptionStatus | null> {
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn(
                'Модуль Purchases не доступен. Проверка статуса подписки невозможна.',
                'checkSubscriptionStatus – SubscriptionService'
            );
            // Проверяем кеш даже если Purchases недоступен
            const cachedSubscription = await this.cacheService.getCachedSubscription();
            if (cachedSubscription) {
                logger.debug(
                    'Использование кешированного статуса подписки (Purchases недоступен)',
                    'checkSubscriptionStatus – SubscriptionService'
                );
                return this.mapCacheDataToSubscriptionStatus(cachedSubscription);
            }
            return null; // Возвращаем null, если нет ни Purchases, ни кеша
        }
        try {
            // Не вызываем ensureInitialized здесь, т.к. getCustomerInfo сам его вызовет
            // Но можно добавить для явности, если getCustomerInfo может работать без configure
            if (!this.isInitialized) {
                // Попытаемся инициализировать, если еще не сделано
                await this.initialize();
                // Если инициализация не удалась (например, нет ключа или не iOS), getCustomerInfo все равно может вернуть ошибку
                if (!this.isInitialized) {
                    logger.warn(
                        'RevenueCat не инициализирован. Проверка статуса подписки может быть неточной.',
                        'checkSubscriptionStatus – SubscriptionService'
                    );
                    // Попробуем вернуть из кеша, если есть
                    const cachedSubscription = await this.cacheService.getCachedSubscription();
                    if (cachedSubscription) {
                        logger.debug(
                            'Использование кешированного статуса подписки (инициализация не удалась)',
                            'checkSubscriptionStatus – SubscriptionService'
                        );
                        return this.mapCacheDataToSubscriptionStatus(cachedSubscription);
                    }
                    return null; // Возвращаем null если инициализация не удалась и нет кеша
                }
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
            logger.debug(
                'Кеш пуст, запрашиваем CustomerInfo из RevenueCat',
                'checkSubscriptionStatus – SubscriptionService'
            );
            const customerInfo = await Purchases.getCustomerInfo();
            return this.updateSubscriptionStatusFromCustomerInfo(customerInfo);
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - checkSubscriptionStatus',
                'Ошибка при проверке статуса подписки'
            );
            // При ошибке попробуем вернуть из кеша
            try {
                const cachedSubscription = await this.cacheService.getCachedSubscription();
                if (cachedSubscription) {
                    logger.warn(
                        'Возвращаем кешированный статус подписки из-за ошибки запроса',
                        'checkSubscriptionStatus – SubscriptionService'
                    );
                    return this.mapCacheDataToSubscriptionStatus(cachedSubscription);
                }
            } catch (cacheError) {
                logger.error(
                    cacheError,
                    'SubscriptionService - checkSubscriptionStatus',
                    'Ошибка при чтении кеша после ошибки проверки статуса'
                );
            }
            // Если не удалось получить данные и кеш пуст или вызвал ошибку
            return null;
        }
    }

    /**
     * Принудительное обновление статуса подписки
     */
    async forceRefreshSubscriptionStatus(): Promise<SubscriptionStatus | null> {
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn(
                'Модуль Purchases не доступен. Принудительное обновление статуса невозможно.',
                'forceRefreshSubscriptionStatus – SubscriptionService'
            );
            return null; // Возвращаем null, так как обновить не можем
        }
        try {
            if (!(await this.ensureInitialized())) {
                logger.error(
                    'Не удалось инициализировать RevenueCat для обновления статуса',
                    'forceRefreshSubscriptionStatus – SubscriptionService'
                );
                return null; // Возвращаем null при ошибке инициализации
            }

            logger.debug(
                'Принудительное обновление статуса подписки',
                'forceRefreshSubscriptionStatus – SubscriptionService'
            );
            // syncPurchases может быть полезен, если были покупки вне приложения
            await Purchases.syncPurchases();

            // Получаем свежую информацию
            const customerInfo = await Purchases.getCustomerInfo();
            // Очищаем кеш перед обновлением, чтобы гарантировать запись свежих данных
            await this.cacheService.clearCache();
            return this.updateSubscriptionStatusFromCustomerInfo(customerInfo);
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - forceRefreshSubscriptionStatus',
                'Ошибка при обновлении статуса подписки'
            );
            // При ошибке не возвращаем ничего, чтобы не перезаписать старыми данными
            return null;
        }
    }

    /**
     * Выход пользователя
     */
    async logout(): Promise<void> {
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn(
                'Модуль Purchases не доступен. Выход из RevenueCat не требуется.',
                'logout – SubscriptionService'
            );
            // Очищаем локальные данные даже если Purchases недоступен
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS);
            await this.cacheService.clearCache();
            this.currentUserId = null; // Сбрасываем ID пользователя локально
            logger.debug(
                'Локальные данные подписки очищены при выходе (Purchases недоступен)',
                'logout – SubscriptionService'
            );
            return;
        }
        try {
            // Проверяем инициализацию перед вызовом logOut
            if (!this.isInitialized) {
                logger.debug('RevenueCat не инициализирован, выход не требуется', 'logout – SubscriptionService');
                // Все равно очищаем локальные данные
                await storage.remove(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS);
                await this.cacheService.clearCache();
                this.currentUserId = null;
                logger.debug(
                    'Локальные данные подписки очищены при выходе (RevenueCat не инициализирован)',
                    'logout – SubscriptionService'
                );
                return;
            }

            logger.debug('Выход пользователя из RevenueCat', 'logout – SubscriptionService');
            await Purchases.logOut();
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS);
            // Очищаем кеш при выходе
            await this.cacheService.clearCache();
            this.currentUserId = null; // Сбрасываем ID пользователя
            logger.debug(
                'Пользователь успешно вышел из RevenueCat и локальные данные очищены',
                'logout – SubscriptionService'
            );
        } catch (error) {
            logger.error(error, 'SubscriptionService - logout', 'Ошибка при выходе пользователя из RevenueCat');
            // Даже при ошибке выхода из RC, пытаемся очистить локальные данные
            try {
                await storage.remove(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS);
                await this.cacheService.clearCache();
                this.currentUserId = null;
                logger.debug(
                    'Локальные данные подписки очищены после ошибки выхода из RevenueCat',
                    'logout – SubscriptionService'
                );
            } catch (clearError) {
                logger.error(
                    clearError,
                    'SubscriptionService - logout',
                    'Ошибка при очистке локальных данных после ошибки выхода'
                );
            }
            throw error; // Пробрасываем оригинальную ошибку выхода
        }
    }

    /**
     * Проверка подписки на сервере (через RevenueCat)
     */
    async verifySubscriptionWithServer(): Promise<boolean> {
        // Проверка на наличие Purchases
        if (!Purchases) {
            logger.warn(
                'Модуль Purchases не доступен. Проверка подписки невозможна.',
                'verifySubscriptionWithServer – SubscriptionService'
            );
            // Возвращаем false, так как проверить не можем
            return false;
        }
        try {
            if (!(await this.ensureInitialized())) {
                logger.error(
                    'Не удалось инициализировать RevenueCat для проверки подписки',
                    'verifySubscriptionWithServer – SubscriptionService'
                );
                return false; // Возвращаем false при ошибке инициализации
            }

            logger.debug('Проверка подписки через RevenueCat', 'verifySubscriptionWithServer – SubscriptionService');

            // Получаем текущую информацию о клиенте
            const customerInfo = await Purchases.getCustomerInfo();

            // Обновляем локальный статус подписки на основе полученных данных
            const status = await this.updateSubscriptionStatusFromCustomerInfo(customerInfo);

            // Проверяем активность подписки из обновленного статуса
            const hasActiveSubscriptions = status?.isActive ?? false;

            logger.debug(
                `Проверка через RevenueCat завершена. Результат: ${hasActiveSubscriptions}`,
                'verifySubscriptionWithServer – SubscriptionService'
            );
            return hasActiveSubscriptions;
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - verifySubscriptionWithServer',
                'Ошибка при проверке подписки через RevenueCat'
            );
            // Возвращаем false при ошибке
            return false;
        }
    }

    /**
     * Преобразует данные из кеша в формат SubscriptionStatus
     */
    private mapCacheDataToSubscriptionStatus(cacheData: SubscriptionCacheData): SubscriptionStatus {
        return {
            tier: cacheData.tier,
            isActive: cacheData.isPremium || cacheData.isPremiumAI, // Определяем активность по флагам кеша
            expiresAt: cacheData.expirationDate || '',
            // Данных об автопродлении в кеше нет, ставим значения по умолчанию
            autoRenew: true,
            cancelAtPeriodEnd: false,
        };
    }

    /**
     * Обновляет статус подписки на основе информации о клиенте
     * и сохраняет его в хранилище и кеше
     */
    private async updateSubscriptionStatusFromCustomerInfo(customerInfo: CustomerInfo): Promise<SubscriptionStatus> {
        try {
            // Проверяем свойство entitlements вместо activeSubscriptions для более надежного определения доступа
            // Идентификатор 'premium' должен совпадать с тем, что настроено в RevenueCat Entitlements
            const premiumEntitlement = customerInfo.entitlements.active['premium']; // Замените 'premium' на ваш ID
            const premiumAIEntitlement = customerInfo.entitlements.active['premium_ai']; // Замените 'premium_ai' на ваш ID

            let tier: SubscriptionTier = SUBSCRIPTION_TIERS.FREE;
            let isActive = false;
            let activeEntitlementIdentifier: string | undefined = undefined; // Сохраним идентификатор активного доступа

            if (premiumAIEntitlement) {
                tier = SUBSCRIPTION_TIERS.PREMIUM_AI;
                isActive = true;
                activeEntitlementIdentifier = premiumAIEntitlement.identifier;
            } else if (premiumEntitlement) {
                tier = SUBSCRIPTION_TIERS.PREMIUM;
                isActive = true;
                activeEntitlementIdentifier = premiumEntitlement.identifier;
            }

            // Получаем информацию об истечении подписки из активного entitlement, если он есть
            let expiresAtDate: Date | null = null;
            let expiresAt: string = '';
            let autoRenew = false; // По умолчанию считаем, что автопродление выключено
            let cancelAtPeriodEnd = true; // По умолчанию считаем, что отменится
            let productId: string | undefined = undefined; // ID продукта из RevenueCat

            const activeEntitlement = premiumAIEntitlement || premiumEntitlement;

            if (activeEntitlement) {
                productId = activeEntitlement.productIdentifier;
                if (activeEntitlement.expirationDate) {
                    expiresAtDate = new Date(activeEntitlement.expirationDate);
                    expiresAt = activeEntitlement.expirationDate;
                }
                // Проверяем, отменится ли подписка в конце периода
                // `willRenew` показывает, будет ли следующее списание
                autoRenew = activeEntitlement.willRenew;
                cancelAtPeriodEnd = !activeEntitlement.willRenew;
            }

            // Формируем статус подписки
            const subscriptionStatus: SubscriptionStatus = {
                tier,
                isActive, // Используем вычисленное значение isActive
                expiresAt,
                autoRenew,
                cancelAtPeriodEnd,
            };

            logger.debug(`Сформирован статус подписки: ${JSON.stringify(subscriptionStatus)}`);

            // Сохраняем в хранилище
            await storage.set(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS, subscriptionStatus, true);
            logger.debug('Статус подписки сохранен в локальное хранилище.');

            // Кешируем данные о подписке
            await this.cacheService.cacheSubscription({
                isPremium: tier === SUBSCRIPTION_TIERS.PREMIUM || tier === SUBSCRIPTION_TIERS.PREMIUM_AI,
                isPremiumAI: tier === SUBSCRIPTION_TIERS.PREMIUM_AI,
                tier,
                expirationDate: expiresAt || undefined, // Используем expiresAt из entitlement
                productId: productId, // Используем productId из entitlement
            });
            logger.debug('Статус подписки сохранен в кеш.');

            logger.debug(`Статус подписки обновлен: ${JSON.stringify(subscriptionStatus)}`);
            return subscriptionStatus;
        } catch (error) {
            logger.error(
                error,
                'SubscriptionService - updateSubscriptionStatusFromCustomerInfo',
                'Ошибка при обновлении статуса подписки из CustomerInfo'
            );
            // В случае ошибки возвращаем "бесплатный" статус, чтобы не блокировать пользователя из-за ошибки обновления
            // Но не сохраняем его, чтобы не перезаписать действительный статус при временной ошибке
            return {
                tier: SUBSCRIPTION_TIERS.FREE,
                isActive: false,
                expiresAt: '',
                autoRenew: false,
                cancelAtPeriodEnd: false,
            };
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
                autoRenew: true, // Для теста ставим true
                cancelAtPeriodEnd: false, // Для теста ставим false
            };

            await storage.set(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS, subscriptionStatus, true);

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
                cancelAtPeriodEnd: false, // У бесплатной подписки нет отмены в конце периода
            };

            // Обновляем локальное хранилище
            await storage.set(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS, freeSubscriptionStatus, true);

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
     * Полная очистка кеша подписки и локального хранилища (для отладки)
     */
    async clearSubscriptionCache(): Promise<boolean> {
        try {
            logger.debug(
                'Очистка всех данных подписки (кеш и хранилище)',
                'clearSubscriptionCache – SubscriptionService'
            );

            // Очищаем кеш в сервисе кеширования
            await this.cacheService.clearCache();

            // Очищаем локальное хранилище
            await storage.remove(STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_STATUS);

            // Сбрасываем ID пользователя, если он был установлен
            this.currentUserId = null;

            logger.debug('Кеш и хранилище подписки успешно очищены', 'clearSubscriptionCache – SubscriptionService');
            return true;
        } catch (error) {
            logger.error(error, 'SubscriptionService - clearSubscriptionCache', 'Ошибка при очистке данных подписки');
            return false;
        }
    }
}

export const subscriptionService = new SubscriptionService();
