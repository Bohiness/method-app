import { subscriptionService } from '@shared/lib/subscription/subscription.service';
import { Alert, Platform } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';

/**
 * Утилита для отладки RevenueCat в приложении (оптимизировано для iOS)
 */
export const revenueCatDebug = {
    /**
     * Проверяет наличие и отображает информацию о доступных пакетах
     */
    async checkPackages(): Promise<void> {
        try {
            console.log('Инициализация RevenueCat...');
            await subscriptionService.initialize();

            // Показываем информацию о платформе
            const platform = Platform.OS;
            console.log(`Текущая платформа: ${platform}`);

            if (platform !== 'ios') {
                Alert.alert('Проверка RevenueCat', 'В данный момент проверка доступна только для устройств iOS');
                return;
            }

            console.log('Запрос доступных пакетов...');
            const packages = await subscriptionService.getOfferings();

            if (!packages || packages.length === 0) {
                console.warn('Пакеты подписок не найдены');
                Alert.alert('RevenueCat', 'Пакеты подписок не найдены для iOS');
                return;
            }

            console.log(`Найдено ${packages.length} пакетов для iOS:`);
            const packagesInfo = packages.map((pkg: PurchasesPackage, index: number) => {
                const info = {
                    index: index + 1,
                    identifier: pkg.identifier,
                    packageType: pkg.packageType,
                    price: pkg.product.priceString,
                    productId: pkg.product.identifier,
                    hasTrial: !!pkg.product.introPrice,
                    trialDuration: pkg.product.introPrice
                        ? `${pkg.product.introPrice.periodNumberOfUnits} ${pkg.product.introPrice.periodUnit}`
                        : 'нет',
                    subscriptionPeriod: pkg.product.subscriptionPeriod || 'не указан',
                };

                console.log(JSON.stringify(info, null, 2));
                return info;
            });

            // Показываем краткую информацию в алерте
            Alert.alert(
                'RevenueCat пакеты (iOS)',
                `Найдено ${packages.length} пакетов:\n\n` +
                    packagesInfo
                        .map(
                            info =>
                                `${info.index}. ${info.identifier} (${info.price})\n` +
                                `   Тип: ${info.packageType}\n` +
                                `   Пробный период: ${info.trialDuration}`
                        )
                        .join('\n\n')
            );

            return;
        } catch (error) {
            console.error('Ошибка при проверке пакетов RevenueCat:', error);
            Alert.alert('Ошибка', 'Не удалось получить пакеты из RevenueCat');
        }
    },

    /**
     * Проверяет статус подписки пользователя
     */
    async checkSubscriptionStatus(): Promise<void> {
        try {
            // Проверяем платформу
            if (Platform.OS !== 'ios') {
                Alert.alert('Проверка статуса подписки', 'В данный момент проверка статуса доступна только для iOS');
                return;
            }

            console.log('Проверка статуса подписки...');
            const status = await subscriptionService.checkSubscriptionStatus();

            console.log('Статус подписки:', JSON.stringify(status, null, 2));

            Alert.alert(
                'Статус подписки (iOS)',
                `Премиум: ${status.isPremium ? 'Да' : 'Нет'}\n` +
                    `Премиум AI: ${status.isPremiumAI ? 'Да' : 'Нет'}\n` +
                    `Тариф: ${status.tier}`
            );

            return;
        } catch (error) {
            console.error('Ошибка при проверке статуса подписки:', error);
            Alert.alert('Ошибка', 'Не удалось проверить статус подписки');
        }
    },
};
