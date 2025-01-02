import { notificationsApiService } from '@shared/api/notifications/notifications-api.service'
import { storage } from '@shared/lib/storage/storage.service'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

class NotificationsService {
    private readonly PUSH_TOKEN_KEY = 'push-token';

    async registerForPushNotifications() {
        if (!Device.isDevice) {
            throw new Error('Требуется физическое устройство для push-уведомлений');
        }

        try {
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
                projectId: process.env.EXPO_PROJECT_ID // Добавьте в .env
            });

            // Настраиваем канал для Android
            if (Platform.OS === 'android') {
                await this.setupAndroidNotificationChannel();
            }

            // Сохраняем токен локально
            const oldToken = await storage.get<string>(this.PUSH_TOKEN_KEY);
            
            if (oldToken && oldToken !== expoPushToken.data) {
                // Если токен изменился, обновляем на сервере
                await notificationsApiService.updateDeviceToken(oldToken, expoPushToken.data);
            } else if (!oldToken) {
                // Если токена нет, регистрируем новое устройство
                await notificationsApiService.registerDevice(expoPushToken.data);
            }

            // Сохраняем новый токен
            await storage.set(this.PUSH_TOKEN_KEY, expoPushToken.data);

            return expoPushToken;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
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

    async deregisterPushNotifications() {
        try {
            const token = await storage.get<string>(this.PUSH_TOKEN_KEY);
            if (token) {
                await notificationsApiService.deactivateDevice(token);
                await storage.remove(this.PUSH_TOKEN_KEY);
            }
        } catch (error) {
            console.error('Error deregistering push notifications:', error);
            throw error;
        }
    }
}

export const notificationsService = new NotificationsService();