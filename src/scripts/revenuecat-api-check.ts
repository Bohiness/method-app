/**
 * Скрипт для проверки настроек RevenueCat через REST API
 *
 * Документация: https://docs.revenuecat.com/reference/offerings-1
 */

import axios from 'axios';

// Константы
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';
const REVENUECAT_APP_ID = process.env.EXPO_PUBLIC_REVENUECAT_ID || 'app62c716286d';
const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY; // Секретный ключ API

// Функция для проверки доступных офферингов
async function checkRevenueCatOfferings() {
    if (!REVENUECAT_API_KEY) {
        console.error('Ошибка: REVENUECAT_API_KEY не задан в переменных окружения');
        console.log('Для использования REST API RevenueCat необходим секретный ключ.');
        console.log('Его можно получить в панели управления RevenueCat > Project Settings > API Keys');
        return;
    }

    try {
        console.log(`Запрос офферингов для приложения: ${REVENUECAT_APP_ID}`);

        const response = await axios.get(`${REVENUECAT_API_URL}/subscribers/offerings`, {
            headers: {
                Authorization: `Bearer ${REVENUECAT_API_KEY}`,
                'X-Platform': 'ios', // или 'android'
                'Content-Type': 'application/json',
            },
            params: {
                app_user_id: '$RCAnonymousID:anonymous', // Можно использовать анонимный ID
            },
        });

        console.log('Ответ от RevenueCat API:');
        console.log(JSON.stringify(response.data, null, 2));

        const { offerings } = response.data;

        if (offerings && offerings.current) {
            console.log(`\nТекущий офферинг: ${offerings.current}`);

            const currentOffering = offerings.all[offerings.current];
            console.log(`Доступные пакеты в офферинге ${offerings.current}:`);

            Object.entries(currentOffering.packages).forEach(([packageId, packageData]) => {
                console.log(`\nПакет: ${packageId}`);
                console.log(JSON.stringify(packageData, null, 2));
            });
        } else {
            console.log('Текущий офферинг не найден');
        }
    } catch (error: any) {
        console.error('Ошибка при запросе к RevenueCat API:', error.message);
        if (error.response) {
            console.error('Ответ от сервера:', error.response.data);
        }
    }
}

// Функция для проверки цен продуктов
async function checkRevenueCatProductPrices() {
    if (!REVENUECAT_API_KEY) {
        console.error('Ошибка: REVENUECAT_API_KEY не задан в переменных окружения');
        return;
    }

    try {
        console.log(`Запрос информации о ценах для приложения: ${REVENUECAT_APP_ID}`);

        const response = await axios.get(`${REVENUECAT_API_URL}/products`, {
            headers: {
                Authorization: `Bearer ${REVENUECAT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            params: {
                app_id: REVENUECAT_APP_ID,
            },
        });

        console.log('Список продуктов и цен:');

        const { products } = response.data;

        if (products && Object.keys(products).length > 0) {
            Object.entries(products).forEach(([productId, productData]) => {
                console.log(`\nПродукт: ${productId}`);
                console.log(JSON.stringify(productData, null, 2));
            });
        } else {
            console.log('Продукты не найдены');
        }
    } catch (error: any) {
        console.error('Ошибка при запросе цен:', error.message);
        if (error.response) {
            console.error('Ответ от сервера:', error.response.data);
        }
    }
}

// Запуск скрипта
async function main() {
    console.log('=== Проверка настроек RevenueCat ===\n');

    await checkRevenueCatOfferings();
    console.log('\n=== Проверка цен продуктов ===\n');
    await checkRevenueCatProductPrices();
}

main().catch(console.error);
