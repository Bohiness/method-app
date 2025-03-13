import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

/**
 * Скрипт для проверки доступных пакетов в RevenueCat
 */
async function checkRevenueCatOfferings() {
    try {
        console.log('Инициализация RevenueCat...');

        // Получаем ключ API из переменных окружения
        const REVENUECAT_KEY = Platform.select({
            ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
            android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
        });

        if (!REVENUECAT_KEY) {
            throw new Error('Ключ RevenueCat не настроен');
        }

        // Инициализируем RevenueCat
        await Purchases.configure({
            apiKey: REVENUECAT_KEY,
            useAmazon: false,
        });

        console.log('RevenueCat инициализирован успешно');
        console.log('Получение пакетов подписок...');

        // Получаем пакеты подписок
        const offerings = await Purchases.getOfferings();

        if (!offerings.current) {
            console.log('Активные пакеты не найдены');
            return;
        }

        console.log('Найдены активные пакеты:');
        console.log(`Название текущего офферинга: ${offerings.current.identifier}`);

        const packages = offerings.current.availablePackages;
        console.log(`Количество доступных пакетов: ${packages.length}`);

        // Выводим информацию о каждом пакете
        packages.forEach((pkg: PurchasesPackage, index: number) => {
            console.log(`\nПакет ${index + 1}:`);
            console.log(`- Идентификатор: ${pkg.identifier}`);
            console.log(`- Тип пакета: ${pkg.packageType}`);
            console.log(`- Цена: ${pkg.product.priceString} (${pkg.product.price} ${pkg.product.currencyCode})`);
            console.log(`- Идентификатор продукта: ${pkg.product.identifier}`);

            if (pkg.product.introPrice) {
                console.log(
                    `- Пробный период: ${pkg.product.introPrice.periodNumberOfUnits} ${pkg.product.introPrice.periodUnit}`
                );
                console.log(`- Цена после пробного периода: ${pkg.product.introPrice.priceString}`);
            }

            if (pkg.product.subscriptionPeriod) {
                console.log(`- Период подписки: ${pkg.product.subscriptionPeriod}`);
            }
        });
    } catch (error) {
        console.error('Ошибка при проверке RevenueCat:', error);
    }
}

// Запускаем функцию проверки
checkRevenueCatOfferings();
