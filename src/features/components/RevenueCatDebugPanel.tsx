import { subscriptionService } from '@shared/lib/subscription/subscription.service'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import React, { useState } from 'react'
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native'
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
            <View style={[styles.toggleButton, { bottom: insets.bottom + 8 }]}>
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
        <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.card}>
                <Text className="text-lg font-bold mb-4">RevenueCat Дебаг {isIOS ? '' : '(Только iOS)'}</Text>

                <View style={styles.buttonsContainer}>
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
                    <View style={styles.warningContainer}>
                        <Text className="text-amber-600">{platformWarning}</Text>
                    </View>
                )}

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" />
                        <Text className="mt-2">Загрузка данных...</Text>
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text className="text-red-500">{error}</Text>
                    </View>
                )}

                {!isIOS && !platformWarning && (
                    <View style={styles.warningContainer}>
                        <Text className="text-center">Проверка RevenueCat доступна только на iOS устройствах</Text>
                    </View>
                )}

                {subscriptionStatus && isIOS && (
                    <View style={styles.statusContainer}>
                        <Text className="text-md font-bold mb-1">Статус подписки:</Text>
                        <Text>Премиум: {subscriptionStatus.isPremium ? 'Да' : 'Нет'}</Text>
                        <Text>Премиум AI: {subscriptionStatus.isPremiumAI ? 'Да' : 'Нет'}</Text>
                        <Text>Тариф: {subscriptionStatus.tier}</Text>
                    </View>
                )}

                {packages.length > 0 && isIOS ? (
                    <ScrollView style={styles.packagesContainer}>
                        <Text className="text-md font-bold mb-2">Доступные пакеты iOS ({packages.length}):</Text>

                        {packages.map((pkg, index) => (
                            <View key={pkg.identifier} style={styles.packageItem}>
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

const styles = StyleSheet.create({
    toggleButton: {
        position: 'absolute',
        right: 16,
        zIndex: 1000,
    },
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    card: {
        padding: 16,
        borderRadius: 12,
        maxHeight: 500,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 16,
    },
    errorContainer: {
        padding: 8,
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    warningContainer: {
        padding: 8,
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 204, 0, 0.1)',
    },
    statusContainer: {
        marginVertical: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    packagesContainer: {
        maxHeight: 300,
    },
    packageItem: {
        marginVertical: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
}) 