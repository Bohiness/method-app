import { apiClient } from '@shared/config/api-client'
import { DeviceToken } from '@shared/types/notifications/NotificationTypes'
import { Platform } from 'react-native'
import * as Device from 'expo-device'

class NotificationsApiService {
    private readonly BASE_PATH = '/api/v2/notifications';

    private async getDeviceId(): Promise<string> {
        return Device.modelId ?? Device.deviceName ?? 'unknown';
    }

    async registerDevice(token: string): Promise<DeviceToken> {
        try {
            const deviceInfo = {
                token,
                platform: Platform.OS,
                device_id: await this.getDeviceId(),
            };

            const response = await apiClient.post<DeviceToken>(
                `${this.BASE_PATH}/devices/`,
                deviceInfo
            );
            
            return response;
        } catch (error) {
            console.error('Failed to register device:', error);
            throw error;
        }
    }

    async updateDeviceToken(oldToken: string, newToken: string): Promise<DeviceToken> {
        try {
            const response = await apiClient.put<DeviceToken>(
                `${this.BASE_PATH}/devices/${oldToken}/`,
                { token: newToken }
            );
            
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
}

export const notificationsApiService = new NotificationsApiService();
