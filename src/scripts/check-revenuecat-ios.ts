import Purchases, { PurchasesPackage } from 'react-native-purchases';

/**
 * Скрипт для проверки доступных пакетов в RevenueCat (только iOS)
 */
async function checkRevenueCatOfferingsIOS() {
    try {
        console.log('Инициализация RevenueCat для iOS...');

        // Используем только ключ для iOS
        const REVENUECAT_IOS_KEY = 'appl_ViadzBaSFCEYsEHisYtuLYzcdsv';

        // Инициализируем RevenueCat с iOS ключом
        await Purchases.configure({
            apiKey: REVENUECAT_IOS_KEY,
            useAmazon: false,
        });

        console.log('RevenueCat инициализирован успешно для iOS');
        console.log('Получение пакетов подписок для iOS...');

        // Получаем пакеты подписок
        const offerings = await Purchases.getOfferings();

        if (!offerings.current) {
            console.log('Активные пакеты на iOS не найдены');
            return;
        }

        console.log('Найдены активные пакеты для iOS:');
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
        console.error('Ошибка при проверке RevenueCat iOS:', error);
    }
}

// Запускаем функцию проверки
checkRevenueCatOfferingsIOS();
