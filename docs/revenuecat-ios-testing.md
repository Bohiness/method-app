# Руководство по тестированию RevenueCat (iOS)

Это руководство предоставляет инструкции по проверке пакетов и настроек RevenueCat для iOS в вашем приложении.

## Подготовка

Если вы работаете только с iOS и не имеете Android-окружения, необходимо использовать специальные инструменты для проверки пакетов RevenueCat.

### Установка необходимых зависимостей

```bash
# Установка типов Node.js для скриптов
npm install --save-dev @types/node

# Установка axios для REST API запросов (если не установлен)
npm install axios
```

## Способы проверки пакетов RevenueCat на iOS

### 1. Через компонент отладки в приложении

В приложении уже встроен компонент для отладки RevenueCat, который автоматически определяет iOS-устройство и отображает соответствующую информацию.

1. Откройте экран подписки
2. В режиме разработки внизу экрана нажмите на кнопку "Показать отладочную панель"
3. Нажмите кнопку "Проверить пакеты"
4. Вы увидите список доступных пакетов для iOS и текущий статус подписки

### 2. Через REST API RevenueCat (без симулятора)

Для проверки через REST API запустите специальный скрипт:

```bash
# Установите секретный ключ API как переменную окружения
export REVENUECAT_API_KEY=your_secret_key_here

# Запустите скрипт проверки iOS
npx ts-node src/scripts/revenuecat-api-ios.ts
```

Этот скрипт запросит информацию о доступных офферингах и продуктах для iOS через REST API RevenueCat.

### 3. Через utilities для отладки

Вы можете использовать встроенные утилиты в коде:

```typescript
import { revenueCatDebug } from "@shared/utils/revenuecat-debug";

// В любом компоненте
async function checkIOSPackages() {
    // Эта функция проверит платформу и покажет информацию только для iOS
    await revenueCatDebug.checkPackages();
}

// Проверка статуса подписки
async function checkIOSSubscriptionStatus() {
    await revenueCatDebug.checkSubscriptionStatus();
}
```

### 4. Запуск на iOS-симуляторе

Если у вас macOS, лучший способ проверить все настройки RevenueCat - запустить приложение на iOS-симуляторе:

```bash
# Запуск на iOS-симуляторе
npx expo run:ios
```

## Диагностика проблем с RevenueCat на iOS

### Если пакеты не отображаются

1. Проверьте настройки в консоли RevenueCat:

    - Убедитесь, что офферинги настроены правильно для iOS
    - Проверьте, что продукты Apple App Store добавлены в соответствующие офферинги
    - Подтвердите, что продукты активированы

2. Проверьте настройки окружения:

    - Правильно ли указан API-ключ для iOS в приложении: `appl_ViadzBaSFCEYsEHisYtuLYzcdsv`
    - Соответствует ли App Bundle ID в XCode/Expo тому, что указан в RevenueCat
    - Правильно ли настроен App Store Connect и добавлены ли продукты

3. Типичные iOS-специфичные проблемы:
    - Убедитесь, что приложение использует правильный App Store Team ID
    - Проверьте, что в режиме разработки используется песочница App Store

### Если скрипты не запускаются

Если скрипт выдает ошибку, связанную с отсутствием типов:

```bash
npm install --save-dev @types/node
```

Это установит необходимые типы для Node.js.

## Полезные ссылки

-   [Документация RevenueCat](https://docs.revenuecat.com/)
-   [Руководство по интеграции RevenueCat для iOS](https://docs.revenuecat.com/docs/ios)
-   [REST API RevenueCat](https://docs.revenuecat.com/reference/start)
-   [Проверка офферингов в RevenueCat](https://docs.revenuecat.com/reference/offerings-1)

---

**Примечание**: В App Store лучше использовать реальный Apple ID для покупок, так как некоторые аккаунты песочницы могут иметь ограничения.
