import { subscriptionService } from '@shared/lib/subscription/subscription.service'
import { Alert, AlertTitle } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React, { useState } from 'react'
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
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
    const [platformWarning, setPlatformWarning] = useState<string | null>(null)

    // Проверяем, что мы на iOS
    const isIOS = Platform.OS === 'ios'

    const checkPackages = async () => {
        // Если не iOS, показываем предупреждение
        if (!isIOS) {
            setPlatformWarning('RevenueCat проверка доступна только на iOS')
            setError(null)
            return
        }

        setPlatformWarning(null)
        setLoading(true)
        setError(null)

        try {
            // Инициализация, если ещё не инициализирован
            await subscriptionService.initialize()

            // Получение пакетов
            const availablePackages = await subscriptionService.getOfferings()
            setPackages(availablePackages || [])

            // Проверка статуса подписки
            const status = await subscriptionService.checkSubscriptionStatus()
            setSubscriptionStatus(status)
        } catch (err: any) {
            setError(err.message || 'Ошибка при проверке RevenueCat')
            console.error('RevenueCat debug error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isVisible) {
        return (
            <View >
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
        <View>
            <View>
                <Text className="text-lg font-bold mb-4">
                    RevenueCat Дебаг {isIOS ? '' : '(Только iOS)'}
                </Text>

                <View>
                    <Button
                        variant="secondary"
                        size="sm"
                        onPress={checkPackages}
                        disabled={loading || !isIOS}
                    >
                        Проверить пакеты
                    </Button>

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
                    <View>
                        <ActivityIndicator size="large" />
                        <Text className="mt-2">Загрузка данных...</Text>
                    </View>
                )}

                {error && (
                    <View>
                        <Text className="text-red-500">{error}</Text>
                    </View>
                )}

                {!isIOS && !platformWarning && (
                    <View>
                        <Text className="text-center">Проверка RevenueCat доступна только на iOS устройствах</Text>
                    </View>
                )}

                {subscriptionStatus && isIOS && (
                    <View>
                        <Text className="text-md font-bold mb-1">Статус подписки:</Text>
                        <Text>Премиум: {subscriptionStatus.isPremium ? 'Да' : 'Нет'}</Text>
                        <Text>Премиум AI: {subscriptionStatus.isPremiumAI ? 'Да' : 'Нет'}</Text>
                        <Text>Тариф: {subscriptionStatus.tier}</Text>
                    </View>
                )}

                {packages.length > 0 && isIOS ? (
                    <ScrollView>
                        <Text className="text-md font-bold mb-2">Доступные пакеты iOS ({packages.length}):</Text>

                        {packages.map((pkg, index) => (
                            <View key={pkg.identifier}>
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
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    isIOS && !loading && !error && (
                        <Text className="my-4 text-center">Нет доступных пакетов</Text>
                    )
                )}
            </View>
        </View>
    )
}
