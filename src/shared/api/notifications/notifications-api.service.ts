import { apiClient } from '@shared/config/api-client';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';
import {
    DeviceToken,
    GroupNotification,
    NotificationCategory,
    NotificationHistory,
    NotificationSettings,
    NotificationSettingsWithCategories,
    Quote,
    RecurringNotification,
} from '@shared/types/notifications/NotificationTypes';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

class NotificationsApiService {
    private readonly BASE_PATH = '/api/v2/notifications';

    private async getDeviceId(): Promise<string> {
        return Device.modelId ?? Device.deviceName ?? 'unknown';
    }

    // Методы для управления устройствами
    async getDevices(): Promise<DeviceToken[]> {
        try {
            const response = await apiClient.get<DeviceToken[]>(`${this.BASE_PATH}/devices/`);
            return response;
        } catch (error) {
            console.error('Failed to get devices:', error);
            throw error;
        }
    }

    async registerDevice(token: string): Promise<DeviceToken> {
        try {
            const deviceInfo = {
                token,
                platform: Platform.OS,
                device_id: await this.getDeviceId(),
                app_version: Device.osVersion,
                device_model: Device.modelName,
                device_os: Device.osName,
                device_os_version: Device.osVersion,
            };

            const response = await apiClient.post<DeviceToken>(`${this.BASE_PATH}/devices/`, deviceInfo);

            return response;
        } catch (error) {
            console.error('Failed to register device:', error);
            throw error;
        }
    }

    async updateDeviceToken(oldToken: string, newToken: string): Promise<DeviceToken> {
        try {
            const response = await apiClient.put<DeviceToken>(`${this.BASE_PATH}/devices/${oldToken}/`, {
                token: newToken,
            });

            return response;
        } catch (error) {
            console.error('Failed to update device token:', error);
            throw error;
        }
    }

    async deactivateDevice(token: string): Promise<void> {
        try {
            await apiClient.delete(`${this.BASE_PATH}/devices/${token}/`);
        } catch (error) {
            console.error('Failed to deactivate device:', error);
            throw error;
        }
    }

    async deactivateDeviceById(deviceId: string): Promise<void> {
        try {
            await apiClient.post(`${this.BASE_PATH}/devices/deactivate/`, { device_id: deviceId });
        } catch (error) {
            console.error('Failed to deactivate device by ID:', error);
            throw error;
        }
    }

    // Методы для работы с настройками уведомлений
    async getNotificationSettings(): Promise<NotificationSettings> {
        try {
            const response = await apiClient.get<NotificationSettings>(`${this.BASE_PATH}/settings/`);
            return response;
        } catch (error) {
            console.error('Failed to get notification settings:', error);
            throw error;
        }
    }

    async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
        try {
            const response = await apiClient.patch<NotificationSettings>(`${this.BASE_PATH}/settings/`, settings);
            return response;
        } catch (error) {
            console.error('Failed to update notification settings:', error);
            throw error;
        }
    }

    // Методы для работы с полными настройками (включая категории)
    async getAllNotificationSettings(): Promise<NotificationSettingsWithCategories> {
        try {
            const response = await apiClient.get<NotificationSettingsWithCategories>(`${this.BASE_PATH}/settings/`);
            return response;
        } catch (error) {
            console.error('Failed to get all notification settings:', error);
            throw error;
        }
    }

    async updateAllNotificationSettings(
        settings: NotificationSettingsWithCategories
    ): Promise<NotificationSettingsWithCategories> {
        try {
            const response = await apiClient.patch<NotificationSettingsWithCategories>(
                `${this.BASE_PATH}/settings/`,
                settings
            );
            return response;
        } catch (error) {
            console.error('Failed to update all notification settings:', error);
            throw error;
        }
    }

    // Методы для работы с категориями уведомлений
    async getNotificationCategories(): Promise<NotificationCategory[]> {
        try {
            const response = await apiClient.get<NotificationCategory[]>(`${this.BASE_PATH}/categories/`);
            return response;
        } catch (error) {
            console.error('Failed to get notification categories:', error);
            throw error;
        }
    }

    async updateCategoryPreferences(categoryId: string, enabled: boolean): Promise<void> {
        try {
            await apiClient.patch(`${this.BASE_PATH}/categories/${categoryId}/preferences/`, { enabled });
        } catch (error) {
            console.error('Failed to update category preferences:', error);
            throw error;
        }
    }

    // Методы для работы с историей уведомлений
    async getNotificationHistory(
        page: number = 1,
        limit: number = 20,
        filters?: {
            startDate?: string;
            endDate?: string;
            category?: string;
            read?: boolean;
        }
    ): Promise<PaginatedResponse<NotificationHistory>> {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            // Добавляем фильтры только при наличии значений
            if (filters) {
                if (filters.startDate) queryParams.append('startDate', filters.startDate);
                if (filters.endDate) queryParams.append('endDate', filters.endDate);
                if (filters.category) queryParams.append('category', filters.category);
                if (filters.read !== undefined) queryParams.append('read', filters.read.toString());
            }

            const response = await apiClient.get<PaginatedResponse<NotificationHistory>>(
                `${this.BASE_PATH}/history/?${queryParams}`
            );
            return response;
        } catch (error) {
            console.error('Failed to get notification history:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<void> {
        try {
            await apiClient.post(`${this.BASE_PATH}/history/${notificationId}/read/`);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead(): Promise<void> {
        try {
            await apiClient.post(`${this.BASE_PATH}/history/read-all/`);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotificationFromHistory(notificationId: string): Promise<void> {
        try {
            await apiClient.delete(`${this.BASE_PATH}/history/${notificationId}/`);
        } catch (error) {
            console.error('Failed to delete notification:', error);
            throw error;
        }
    }

    // Методы для работы с групповыми уведомлениями (для админов)
    async getGroupNotifications(): Promise<GroupNotification[]> {
        try {
            const response = await apiClient.get<GroupNotification[]>(`${this.BASE_PATH}/group/`);
            return response;
        } catch (error) {
            console.error('Failed to get group notifications:', error);
            throw error;
        }
    }

    async createGroupNotification(
        notification: Omit<GroupNotification, 'id' | 'created_at' | 'scheduled_at' | 'sent_at' | 'is_sent'>
    ): Promise<GroupNotification> {
        try {
            const response = await apiClient.post<GroupNotification>(`${this.BASE_PATH}/group/`, notification);
            return response;
        } catch (error) {
            console.error('Failed to create group notification:', error);
            throw error;
        }
    }

    async sendGroupNotification(notification: GroupNotification): Promise<void> {
        try {
            await apiClient.post(`${this.BASE_PATH}/group/send/`, notification);
        } catch (error) {
            console.error('Failed to send group notification:', error);
            throw error;
        }
    }

    async scheduleGroupNotification(notification: GroupNotification, scheduledAt: string): Promise<void> {
        try {
            await apiClient.post(`${this.BASE_PATH}/group/schedule/`, {
                ...notification,
                scheduled_at: scheduledAt,
            });
        } catch (error) {
            console.error('Failed to schedule group notification:', error);
            throw error;
        }
    }

    async cancelScheduledGroupNotification(notificationId: string): Promise<void> {
        try {
            await apiClient.delete(`${this.BASE_PATH}/group/schedule/${notificationId}/`);
        } catch (error) {
            console.error('Failed to cancel scheduled notification:', error);
            throw error;
        }
    }

    // Методы для работы с повторяющимися уведомлениями
    async getRecurringNotifications(): Promise<RecurringNotification[]> {
        try {
            const response = await apiClient.get<RecurringNotification[]>(`${this.BASE_PATH}/recurring/`);
            return response;
        } catch (error) {
            console.error('Failed to get recurring notifications:', error);
            throw error;
        }
    }

    async createRecurringNotification(notification: Partial<RecurringNotification>): Promise<RecurringNotification> {
        try {
            const response = await apiClient.post<RecurringNotification>(`${this.BASE_PATH}/recurring/`, notification);
            return response;
        } catch (error) {
            console.error('Failed to create recurring notification:', error);
            throw error;
        }
    }

    async updateRecurringNotification(
        id: string,
        notification: Partial<RecurringNotification>
    ): Promise<RecurringNotification> {
        try {
            const response = await apiClient.put<RecurringNotification>(
                `${this.BASE_PATH}/recurring/${id}/`,
                notification
            );
            return response;
        } catch (error) {
            console.error('Failed to update recurring notification:', error);
            throw error;
        }
    }

    async toggleRecurringNotificationActive(id: string): Promise<{ status: string; is_active: boolean }> {
        try {
            const response = await apiClient.post<{ status: string; is_active: boolean }>(
                `${this.BASE_PATH}/recurring/${id}/toggle_active/`
            );
            return response;
        } catch (error) {
            console.error('Failed to toggle recurring notification:', error);
            throw error;
        }
    }

    async sendRecurringNotificationNow(id: string): Promise<{ status: string; message: string }> {
        try {
            const response = await apiClient.post<{ status: string; message: string }>(
                `${this.BASE_PATH}/recurring/${id}/send_now/`
            );
            return response;
        } catch (error) {
            console.error('Failed to send recurring notification now:', error);
            throw error;
        }
    }

    // Методы для работы с цитатами
    async getQuotes(): Promise<Quote[]> {
        try {
            const response = await apiClient.get<Quote[]>(`${this.BASE_PATH}/quotes/`);
            return response;
        } catch (error) {
            console.error('Failed to get quotes:', error);
            throw error;
        }
    }

    async createQuote(quote: Partial<Quote>): Promise<Quote> {
        try {
            const response = await apiClient.post<Quote>(`${this.BASE_PATH}/quotes/`, quote);
            return response;
        } catch (error) {
            console.error('Failed to create quote:', error);
            throw error;
        }
    }

    async getRandomQuote(categoryId?: string): Promise<Quote> {
        try {
            const url = categoryId
                ? `${this.BASE_PATH}/quotes/random/?category_id=${categoryId}`
                : `${this.BASE_PATH}/quotes/random/`;
            const response = await apiClient.get<Quote>(url);
            return response;
        } catch (error) {
            console.error('Failed to get random quote:', error);
            throw error;
        }
    }

    async resetQuotesUsed(categoryId?: string): Promise<{ status: string; message: string }> {
        try {
            const body = categoryId ? { category_id: categoryId } : {};
            const response = await apiClient.post<{ status: string; message: string }>(
                `${this.BASE_PATH}/quotes/reset_used/`,
                body
            );
            return response;
        } catch (error) {
            console.error('Failed to reset quotes used:', error);
            throw error;
        }
    }

    // Метод для отвязки Telegram
    async unlinkTelegram(): Promise<{ status: string }> {
        try {
            const response = await apiClient.post<{ status: string }>(`${this.BASE_PATH}/telegram/unlink/`);
            return response;
        } catch (error) {
            console.error('Failed to unlink Telegram:', error);
            throw error;
        }
    }
}

export const notificationsApiService = new NotificationsApiService();
