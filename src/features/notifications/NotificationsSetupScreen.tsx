import { dailyNotificationsService } from '@shared/lib/notifications/daily-notifications.service'
import { checkAndRequestNotificationPermissions } from '@shared/lib/notifications/notification-handler'
import { notificationsService } from '@shared/lib/notifications/notifications.service'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'

export const NotificationsSetupScreen: React.FC = () => {
    const [morningEnabled, setMorningEnabled] = useState(false)
    const [eveningEnabled, setEveningEnabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [hasPermission, setHasPermission] = useState(false)

    // Проверяем разрешения и текущие уведомления при загрузке экрана
    useEffect(() => {
        checkPermissionsAndNotifications()
    }, [])

    // Проверка разрешений и текущих уведомлений
    const checkPermissionsAndNotifications = async () => {
        try {
            setLoading(true)

            // Проверяем разрешения
            const permissionGranted = await checkAndRequestNotificationPermissions()
            setHasPermission(permissionGranted)

            if (permissionGranted) {
                // Получаем текущие запланированные уведомления
                const notifications = await notificationsService.getScheduledNotifications()

                // Проверяем, есть ли утреннее уведомление
                const hasMorningNotification = notifications.some(
                    (n) => n.data && (n.data as any).type === 'morning_reflection'
                )

                // Проверяем, есть ли вечернее уведомление
                const hasEveningNotification = notifications.some(
                    (n) => n.data && (n.data as any).type === 'evening_reflection'
                )

                setMorningEnabled(hasMorningNotification)
                setEveningEnabled(hasEveningNotification)
            }
        } catch (error) {
            console.error('Ошибка при проверке разрешений и уведомлений:', error)
            Alert.alert('Ошибка', 'Не удалось проверить настройки уведомлений')
        } finally {
            setLoading(false)
        }
    }

    // Обработка переключения утренних уведомлений
    const handleMorningToggle = async () => {
        try {
            setLoading(true)

            if (!hasPermission) {
                const granted = await checkAndRequestNotificationPermissions()
                if (!granted) {
                    Alert.alert(
                        'Требуется разрешение',
                        'Для отправки уведомлений необходимо разрешение. Пожалуйста, предоставьте его в настройках устройства.'
                    )
                    return
                }
                setHasPermission(true)
            }

            if (morningEnabled) {
                // Отключаем утренние уведомления
                await dailyNotificationsService.cancelMorningNotification()
                setMorningEnabled(false)
            } else {
                // Включаем утренние уведомления
                await dailyNotificationsService.scheduleMorningNotification()
                setMorningEnabled(true)
            }
        } catch (error) {
            console.error('Ошибка при настройке утренних уведомлений:', error)
            Alert.alert('Ошибка', 'Не удалось настроить утренние уведомления')
        } finally {
            setLoading(false)
        }
    }

    // Обработка переключения вечерних уведомлений
    const handleEveningToggle = async () => {
        try {
            setLoading(true)

            if (!hasPermission) {
                const granted = await checkAndRequestNotificationPermissions()
                if (!granted) {
                    Alert.alert(
                        'Требуется разрешение',
                        'Для отправки уведомлений необходимо разрешение. Пожалуйста, предоставьте его в настройках устройства.'
                    )
                    return
                }
                setHasPermission(true)
            }

            if (eveningEnabled) {
                // Отключаем вечерние уведомления
                await dailyNotificationsService.cancelEveningNotification()
                setEveningEnabled(false)
            } else {
                // Включаем вечерние уведомления
                await dailyNotificationsService.scheduleEveningNotification()
                setEveningEnabled(true)
            }
        } catch (error) {
            console.error('Ошибка при настройке вечерних уведомлений:', error)
            Alert.alert('Ошибка', 'Не удалось настроить вечерние уведомления')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Настройка ежедневных уведомлений</Text>

            <View style={styles.card}>
                <View style={styles.notificationItem}>
                    <View>
                        <Text style={styles.notificationTitle}>Утреннее напоминание</Text>
                        <Text style={styles.notificationTime}>8:55</Text>
                        <Text style={styles.notificationDescription}>
                            Напоминание о подготовке к новому дню
                        </Text>
                    </View>
                    <Switch
                        value={morningEnabled}
                        onValueChange={handleMorningToggle}
                        disabled={loading}
                    />
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.notificationItem}>
                    <View>
                        <Text style={styles.notificationTitle}>Вечернее напоминание</Text>
                        <Text style={styles.notificationTime}>20:55</Text>
                        <Text style={styles.notificationDescription}>
                            Напоминание о вечерней рефлексии
                        </Text>
                    </View>
                    <Switch
                        value={eveningEnabled}
                        onValueChange={handleEveningToggle}
                        disabled={loading}
                    />
                </View>
            </View>

            {!hasPermission && (
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={checkAndRequestNotificationPermissions}
                    disabled={loading}
                >
                    <Text style={styles.permissionButtonText}>
                        Разрешить уведомления
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    notificationDescription: {
        fontSize: 14,
        color: '#888',
        maxWidth: '80%',
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}) 