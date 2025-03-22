import { PurchasesPackage } from 'react-native-purchases';

/**
 * Создает моковые данные пакетов подписок для разработки
 * Используется, когда настоящие данные RevenueCat недоступны
 */
export function createMockPackages(): PurchasesPackage[] {
    // Возвращаем модифицированный объект, который будет работать с нашим кодом
    return [
        {
            identifier: 'premium_monthly',
            packageType: 'MONTHLY',
            product: {
                identifier: 'premium_monthly',
                price: 9.99,
                priceString: '$9.99',
                currencyCode: 'USD',
                subscriptionPeriod: 'P1M',
                title: 'Premium Monthly',
                description: 'Premium monthly subscription',
            },
        },
        {
            identifier: 'premium_annual',
            packageType: 'ANNUAL',
            product: {
                identifier: 'premium_annual',
                price: 99.99,
                priceString: '$99.99',
                currencyCode: 'USD',
                subscriptionPeriod: 'P1Y',
                title: 'Premium Annual',
                description: 'Premium annual subscription',
                introPrice: {
                    periodNumberOfUnits: 7,
                },
            },
        },
        {
            identifier: 'premium_ai_monthly',
            packageType: 'MONTHLY',
            product: {
                identifier: 'premium_ai_monthly',
                price: 19.99,
                priceString: '$19.99',
                currencyCode: 'USD',
                subscriptionPeriod: 'P1M',
                title: 'Premium AI Monthly',
                description: 'Premium AI monthly subscription',
            },
        },
        {
            identifier: 'premium_ai_annual',
            packageType: 'ANNUAL',
            product: {
                identifier: 'premium_ai_annual',
                price: 199.99,
                priceString: '$199.99',
                currencyCode: 'USD',
                subscriptionPeriod: 'P1Y',
                title: 'Premium AI Annual',
                description: 'Premium AI annual subscription',
                introPrice: {
                    periodNumberOfUnits: 7,
                },
            },
        },
    ] as unknown as PurchasesPackage[];
}
