import { SUBSCRIPTION_TIERS } from '@shared/constants/substrations/tiers'
import { subscriptionService } from '@shared/lib/subscription/subscription.service'
import { Alert, AlertTitle } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { Card, View } from '@shared/ui/view'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, ScrollView } from 'react-native'
import { PurchasesPackage } from 'react-native-purchases'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Компонент для отладки RevenueCat
 * Оптимизировано для работы на iOS
 */
export const RevenueCatDebugPanel: React.FC = () => {
    const insets = useSafeAreaInsets()
    const [isVisible, setIsVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [packages, setPackages] = useState<PurchasesPackage[]>([])
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
    const [userId, setUserId] = useState<string>('')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [platformWarning, setPlatformWarning] = useState<string | null>(null)

    // Проверяем, что мы на iOS
    const isIOS = Platform.OS === 'ios'

    // Получаем текущий ID пользователя при монтировании
    useEffect(() => {
        if (isIOS && isVisible) {
            const currentId = subscriptionService.getCurrentUserId()
            setCurrentUserId(currentId)
            if (currentId) {
                setUserId(currentId)
            }
        }
    }, [isIOS, isVisible])

    // Очистка сообщений при закрытии/открытии панели
    useEffect(() => {
        setError(null)
        setSuccess(null)
    }, [isVisible])

    // Инициализация SDK и проверка статуса
    const initializeSDK = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Инициализация SDK
            const initResult = await subscriptionService.initialize()

            if (initResult) {
                setSuccess('RevenueCat SDK успешно инициализирован')

                // Обновляем текущий ID пользователя
                const currentId = subscriptionService.getCurrentUserId()
                setCurrentUserId(currentId)
                if (currentId) {
                    setUserId(currentId)
                }
            } else {
                setError('Не удалось инициализировать RevenueCat SDK')
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при инициализации RevenueCat')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Получение пакетов подписок
    const checkPackages = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Получение пакетов
            const availablePackages = await subscriptionService.getOfferings()
            setPackages(availablePackages || [])

            if (availablePackages && availablePackages.length > 0) {
                setSuccess(`Получено ${availablePackages.length} пакетов подписок`)
            } else {
                setSuccess('Пакеты подписок не найдены')
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при получении пакетов')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Проверка статуса подписки
    const checkSubscriptionStatus = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Проверка статуса подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)
            setSuccess('Статус подписки успешно получен')
        } catch (err: any) {
            setError(err.message || 'Ошибка при проверке статуса подписки')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Принудительное обновление статуса подписки
    const forceRefreshStatus = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Принудительное обновление статуса
            const status = await subscriptionService.forceRefreshSubscriptionStatus()
            setSubscriptionStatus(status)
            setSuccess('Статус подписки успешно обновлен')
        } catch (err: any) {
            setError(err.message || 'Ошибка при обновлении статуса подписки')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Проверка подписки на сервере
    const verifySubscription = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Проверка подписки на сервере
            const isValid = await subscriptionService.verifySubscriptionWithServer()
            setSuccess(`Проверка на сервере: подписка ${isValid ? 'активна' : 'не активна'}`)

            // Обновляем статус подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)
        } catch (err: any) {
            setError(err.message || 'Ошибка при проверке подписки на сервере')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Восстановление покупок
    const restorePurchases = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Восстановление покупок
            const customerInfo = await subscriptionService.restorePurchases()

            // Обновляем статус подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)

            setSuccess('Покупки успешно восстановлены')
        } catch (err: any) {
            setError(err.message || 'Ошибка при восстановлении покупок')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Очистка кеша подписки
    const clearCache = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Очистка кеша
            await subscriptionService.clearSubscriptionCache()
            setSuccess('Кеш подписки успешно очищен')

            // Обновляем статус подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)
        } catch (err: any) {
            setError(err.message || 'Ошибка при очистке кеша подписки')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Установка ID пользователя
    const setUserIdHandler = async () => {
        if (!isIOS || !userId.trim()) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS или ID пользователя пуст')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Установка ID пользователя
            await subscriptionService.setUserId(userId.trim())
            setCurrentUserId(userId.trim())
            setSuccess(`ID пользователя успешно установлен: ${userId.trim()}`)
        } catch (err: any) {
            setError(err.message || 'Ошибка при установке ID пользователя')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Активация премиум-плана (только для админов/тестирования)
    const activatePremium = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Активация премиум-плана
            await subscriptionService.activatePremiumPlanForAdmin(SUBSCRIPTION_TIERS.PREMIUM)
            setSuccess('Премиум-план успешно активирован (для тестирования)')

            // Обновляем статус подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)
        } catch (err: any) {
            setError(err.message || 'Ошибка при активации премиум-плана')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Активация премиум AI плана (только для админов/тестирования)
    const activatePremiumAI = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Активация премиум AI плана
            await subscriptionService.activatePremiumPlanForAdmin(SUBSCRIPTION_TIERS.PREMIUM_AI)
            setSuccess('Премиум AI план успешно активирован (для тестирования)')

            // Обновляем статус подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)
        } catch (err: any) {
            setError(err.message || 'Ошибка при активации премиум AI плана')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Деактивация премиум-плана (только для админов/тестирования)
    const deactivatePremium = async () => {
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Деактивация премиум-плана
            await subscriptionService.deactivatePremiumPlanForAdmin()
            setSuccess('Премиум-план успешно деактивирован')

            // Обновляем статус подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)
        } catch (err: any) {
            setError(err.message || 'Ошибка при деактивации премиум-плана')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isVisible) {
        return (
            <View>
                <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => setIsVisible(true)}
                >
                    RevenueCat {isIOS ? 'Дебаг' : 'iOS'}
                </Button>
            </View>
        )
    }

    return (
        <Card className="p-4 my-2">
            <ScrollView>
                <View className="flex-row justify-between items-center mb-4">
                    <Text size='lg' className="font-bold">
                        RevenueCat Дебаг {isIOS ? '' : '(Только iOS)'}
                    </Text>
                    <Button
                        variant="secondary"
                        size="sm"
                        onPress={() => setIsVisible(false)}
                    >
                        Закрыть
                    </Button>
                </View>

                {platformWarning && (
                    <Alert>
                        <AlertTitle>
                            <Text>{platformWarning}</Text>
                        </AlertTitle>
                    </Alert>
                )}

                {loading && (
                    <View className="my-4 items-center">
                        <ActivityIndicator size="large" />
                        <Text className="mt-2">Загрузка данных...</Text>
                    </View>
                )}

                {error && (
                    <Alert variant="destructive" className="my-2">
                        <AlertTitle>
                            <Text variant='error'>{error}</Text>
                        </AlertTitle>
                    </Alert>
                )}

                {success && (
                    <Alert variant="default" className="my-2 bg-green-100">
                        <AlertTitle>
                            <Text variant='success'>{success}</Text>
                        </AlertTitle>
                    </Alert>
                )}

                {!isIOS && !platformWarning && (
                    <View className="my-4">
                        <Text variant='default' align='center'>Проверка RevenueCat доступна только на iOS устройствах</Text>
                    </View>
                )}

                {isIOS && (
                    <View>
                        {/* Группа кнопок инициализации */}
                        <View className="my-2">
                            <Text variant='default' size='lg' className="font-bold mb-2">Инициализация и проверка:</Text>
                            <View className="flex-row flex-wrap gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={initializeSDK}
                                    disabled={loading}
                                >
                                    Инициализировать SDK
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={checkPackages}
                                    disabled={loading}
                                >
                                    Проверить пакеты
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={checkSubscriptionStatus}
                                    disabled={loading}
                                >
                                    Проверить статус
                                </Button>
                            </View>
                        </View>

                        {/* Установка ID пользователя */}
                        <View className="my-4">
                            <Text variant='default' size='lg' weight='bold' className="mb-2">ID пользователя:</Text>
                            {currentUserId && (
                                <Text className="mb-2">Текущий ID: {currentUserId}</Text>
                            )}
                            <View className="flex-row items-center gap-2">
                                <TextInput
                                    value={userId}
                                    onChangeText={setUserId}
                                    placeholder="Введите ID пользователя"
                                    className="flex-1"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={setUserIdHandler}
                                    disabled={loading || !userId.trim()}
                                >
                                    Установить
                                </Button>
                            </View>
                        </View>

                        {/* Действия с подписками */}
                        <View className="my-2">
                            <Text variant='default' size='lg' weight='bold' className="mb-2">Действия с подписками:</Text>
                            <View className="flex-row flex-wrap gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={forceRefreshStatus}
                                    disabled={loading}
                                >
                                    Обновить статус
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={verifySubscription}
                                    disabled={loading}
                                >
                                    Проверить на сервере
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={restorePurchases}
                                    disabled={loading}
                                >
                                    Восстановить покупки
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={clearCache}
                                    disabled={loading}
                                >
                                    Очистить кеш
                                </Button>
                            </View>
                        </View>

                        {/* Админ-функции */}
                        <View className="my-2">
                            <Text variant='default' size='lg' weight='bold' className="mb-2">Админ-функции (только для тестирования):</Text>
                            <View className="flex-row flex-wrap gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={activatePremium}
                                    disabled={loading}
                                >
                                    Активировать Premium
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={activatePremiumAI}
                                    disabled={loading}
                                >
                                    Активировать Premium AI
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onPress={deactivatePremium}
                                    disabled={loading}
                                >
                                    Деактивировать Premium
                                </Button>
                            </View>
                        </View>

                        {/* Статус подписки */}
                        {subscriptionStatus && (
                            <View className="my-4 p-3 border border-gray-200 rounded-md">
                                <Text variant='default' size='lg' weight='bold' className="mb-2">Статус подписки:</Text>
                                <Text>Тариф: {subscriptionStatus.tier}</Text>
                                <Text>Активна: {subscriptionStatus.isActive ? 'Да' : 'Нет'}</Text>
                                {subscriptionStatus.expiresAt && (
                                    <Text>Истекает: {new Date(subscriptionStatus.expiresAt).toLocaleString()}</Text>
                                )}
                                <Text>Автопродление: {subscriptionStatus.autoRenew ? 'Да' : 'Нет'}</Text>
                                <Text>Отменяется в конце периода: {subscriptionStatus.cancelAtPeriodEnd ? 'Да' : 'Нет'}</Text>
                            </View>
                        )}

                        {/* Пакеты подписок */}
                        {packages.length > 0 && (
                            <View className="my-4">
                                <Text variant='default' size='lg' weight='bold' className="mb-2">Доступные пакеты ({packages.length}):</Text>
                                {packages.map((pkg, index) => (
                                    <View key={pkg.identifier} className="mb-4 p-3 border border-gray-200 rounded-md">
                                        <Text className="font-bold">{index + 1}. {pkg.identifier}</Text>
                                        <Text>Тип: {pkg.packageType}</Text>
                                        <Text>Цена: {pkg.product.priceString}</Text>
                                        <Text>Продукт: {pkg.product.identifier}</Text>

                                        {pkg.product.introPrice && (
                                            <Text>
                                                Пробный период: {pkg.product.introPrice.periodNumberOfUnits} {pkg.product.introPrice.periodUnit}
                                            </Text>
                                        )}

                                        {pkg.product.subscriptionPeriod && (
                                            <Text>Период подписки: {pkg.product.subscriptionPeriod}</Text>
                                        )}

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="mt-2"
                                            onPress={async () => {
                                                try {
                                                    setLoading(true)
                                                    setError(null)
                                                    setSuccess(null)
                                                    await subscriptionService.purchasePackage(pkg)
                                                    setSuccess(`Пакет ${pkg.identifier} успешно куплен`)
                                                    const status = await subscriptionService.checkSubscriptionStatus()
                                                    setSubscriptionStatus(status)
                                                } catch (err: any) {
                                                    setError(err.message || `Ошибка при покупке пакета ${pkg.identifier}`)
                                                } finally {
                                                    setLoading(false)
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            Купить
                                        </Button>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </Card>
    )
}
