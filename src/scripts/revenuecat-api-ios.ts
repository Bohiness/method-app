/**
 * Скрипт для проверки настроек RevenueCat iOS через REST API
 *
 * Документация: https://docs.revenuecat.com/reference/offerings-1
 */

import axios from 'axios';

// Константы для iOS
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';
const REVENUECAT_APP_ID = process.env.EXPO_PUBLIC_REVENUECAT_ID || 'app62c716286d';
const REVENUECAT_IOS_API_KEY = 'appl_ViadzBaSFCEYsEHisYtuLYzcdsv'; // Публичный ключ для iOS
const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY; // Секретный ключ API

// Функция для проверки доступных офферингов для iOS
async function checkRevenueCatOfferingsIOS() {
    if (!REVENUECAT_API_KEY) {
        console.error('Ошибка: REVENUECAT_API_KEY не задан в переменных окружения');
        console.log('Для использования REST API RevenueCat необходим секретный ключ.');
        console.log('Его можно получить в панели управления RevenueCat > Project Settings > API Keys');
        return;
    }

    try {
        console.log(`Запрос офферингов для приложения iOS: ${REVENUECAT_APP_ID}`);

        const response = await axios.get(`${REVENUECAT_API_URL}/subscribers/offerings`, {
            headers: {
                Authorization: `Bearer ${REVENUECAT_API_KEY}`,
                'X-Platform': 'ios', // Указываем iOS платформу
                'Content-Type': 'application/json',
            },
            params: {
                app_user_id: '$RCAnonymousID:anonymous', // Можно использовать анонимный ID
            },
        });

        console.log('Ответ от RevenueCat API (iOS):');
        console.log(JSON.stringify(response.data, null, 2));

        const { offerings } = response.data;

        if (offerings && offerings.current) {
            console.log(`\nТекущий офферинг для iOS: ${offerings.current}`);

            const currentOffering = offerings.all[offerings.current];
            console.log(`Доступные пакеты для iOS в офферинге ${offerings.current}:`);

            Object.entries(currentOffering.packages).forEach(([packageId, packageData]) => {
                console.log(`\nПакет: ${packageId}`);
                console.log(JSON.stringify(packageData, null, 2));
            });
        } else {
            console.log('Текущий офферинг для iOS не найден');
        }
    } catch (error: any) {
        console.error('Ошибка при запросе к RevenueCat API:', error.message);
        if (error.response) {
            console.error('Ответ от сервера:', error.response.data);
        }
    }
}

// Функция для проверки цен продуктов iOS
async function checkRevenueCatProductPricesIOS() {
    if (!REVENUECAT_API_KEY) {
        console.error('Ошибка: REVENUECAT_API_KEY не задан в переменных окружения');
        return;
    }

    try {
        console.log(`Запрос информации о ценах iOS для приложения: ${REVENUECAT_APP_ID}`);

        const response = await axios.get(`${REVENUECAT_API_URL}/products`, {
            headers: {
                Authorization: `Bearer ${REVENUECAT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            params: {
                app_id: REVENUECAT_APP_ID,
                platform: 'ios', // Фильтр по iOS платформе
            },
        });

        console.log('Список продуктов и цен для iOS:');

        const { products } = response.data;

        if (products && Object.keys(products).length > 0) {
            Object.entries(products).forEach(([productId, productData]) => {
                console.log(`\nПродукт iOS: ${productId}`);
                console.log(JSON.stringify(productData, null, 2));
            });
        } else {
            console.log('Продукты для iOS не найдены');
        }
    } catch (error: any) {
        console.error('Ошибка при запросе цен:', error.message);
        if (error.response) {
            console.error('Ответ от сервера:', error.response.data);
        }
    }
}

// Запуск скрипта для проверки iOS
async function main() {
    console.log('=== Проверка настроек RevenueCat для iOS ===\n');

    await checkRevenueCatOfferingsIOS();
    console.log('\n=== Проверка цен продуктов iOS ===\n');
    await checkRevenueCatProductPricesIOS();
}

main().catch(console.error);
