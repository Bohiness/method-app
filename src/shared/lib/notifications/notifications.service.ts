import { notificationsApiService } from '@shared/api/notifications/notifications-api.service';
import { storage } from '@shared/lib/storage/storage.service';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface LocalNotification {
    id?: string;
    title: string;
    body: string;
    data?: object;
    trigger?: Notifications.NotificationTriggerInput;
}

class NotificationsService {
    private readonly PUSH_TOKEN_KEY = 'push-token';
    private readonly SCHEDULED_NOTIFICATIONS_KEY = 'scheduled-notifications';
    private isInitialized = false;

    // Инициализация базовых настроек уведомлений
    private async initialize() {
        if (this.isInitialized) return;

        // Настраиваем обработчик уведомлений
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        if (Platform.OS === 'android') {
            await this.setupAndroidNotificationChannel();
        }

        this.isInitialized = true;
    }

    // Регистрация для push-уведомлений
    async registerForPushNotifications() {
        if (!Device.isDevice) {
            throw new Error('Требуется физическое устройство для push-уведомлений');
        }

        try {
            await this.initialize();

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                throw new Error('Не удалось получить разрешение на уведомления');
            }

            // Получаем токен
            const expoPushToken = await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PROJECT_ID,
            });

            // Управление токеном
            const oldToken = await storage.get<string>(this.PUSH_TOKEN_KEY);

            if (oldToken && oldToken !== expoPushToken.data) {
                await notificationsApiService.updateDeviceToken(oldToken, expoPushToken.data);
            } else if (!oldToken) {
                await notificationsApiService.registerDevice(expoPushToken.data);
            }

            await storage.set(this.PUSH_TOKEN_KEY, expoPushToken.data);

            return expoPushToken;
        } catch (error) {
            console.error('Ошибка регистрации push-уведомлений:', error);
            throw error;
        }
    }

    private async setupAndroidNotificationChannel() {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    // Отмена регистрации push-уведомлений
    async deregisterPushNotifications() {
        try {
            const token = await storage.get<string>(this.PUSH_TOKEN_KEY);
            if (token) {
                await notificationsApiService.deactivateDevice(token);
                await storage.remove(this.PUSH_TOKEN_KEY);
            }
        } catch (error) {
            console.error('Ошибка отмены регистрации push-уведомлений:', error);
            throw error;
        }
    }

    // ЛОКАЛЬНЫЕ УВЕДОМЛЕНИЯ

    // Планирование локального уведомления
    async scheduleLocalNotification({ title, body, trigger, data = {} }: LocalNotification): Promise<string> {
        try {
            await this.initialize();

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                },
                trigger: trigger || null,
            });

            // Сохраняем информацию о запланированном уведомлении
            await this.saveScheduledNotification({
                id: notificationId,
                title,
                body,
                trigger,
                data,
            });

            return notificationId;
        } catch (error) {
            console.error('Ошибка планирования уведомления:', error);
            throw error;
        }
    }

    // Получение всех запланированных уведомлений
    async getScheduledNotifications(): Promise<LocalNotification[]> {
        try {
            const notifications = await storage.get<LocalNotification[]>(this.SCHEDULED_NOTIFICATIONS_KEY);
            return notifications || [];
        } catch (error) {
            console.error('Ошибка получения запланированных уведомлений:', error);
            return [];
        }
    }

    // Отмена конкретного уведомления
    async cancelNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            await this.removeScheduledNotification(notificationId);
        } catch (error) {
            console.error('Ошибка отмены уведомления:', error);
            throw error;
        }
    }

    // Отмена всех локальных уведомлений
    async cancelAllLocalNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await storage.set(this.SCHEDULED_NOTIFICATIONS_KEY, []);
        } catch (error) {
            console.error('Ошибка отмены всех уведомлений:', error);
            throw error;
        }
    }

    // Вспомогательные методы для работы с хранилищем

    private async saveScheduledNotification(notification: LocalNotification): Promise<void> {
        const notifications = await this.getScheduledNotifications();
        notifications.push(notification);
        await storage.set(this.SCHEDULED_NOTIFICATIONS_KEY, notifications);
    }

    private async removeScheduledNotification(notificationId: string): Promise<void> {
        const notifications = await this.getScheduledNotifications();
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        await storage.set(this.SCHEDULED_NOTIFICATIONS_KEY, updatedNotifications);
    }

    // Проверка статуса разрешений
    async checkPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
        return await Notifications.getPermissionsAsync();
    }

    // Запрос разрешений
    async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
        return await Notifications.requestPermissionsAsync();
    }
}

export const notificationsService = new NotificationsService();
