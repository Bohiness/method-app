// src/shared/lib/user/anonymous.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';
import { UserType } from '@shared/types/user/UserType';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface AnonymousResponse {
    user: UserType;
    tokens: AuthTokensType;
}

class AnonymousUserService {
    private readonly DEVICE_ID_KEY = 'device-id';
    private readonly ANONYMOUS_USER_KEY = 'anonymous-user';

    /**
     * Генерация уникального идентификатора устройства
     */
    private async generateDeviceId(): Promise<string> {
        try {
            console.debug('AnonymousService: Generating device ID...');
            let uniqueId: string;

            if (Platform.OS === 'android') {
                const androidId = await Application.getAndroidId();
                uniqueId = androidId || Application.applicationId || '';
            } else if (Platform.OS === 'ios') {
                const iosId = await Application.getIosIdForVendorAsync();
                uniqueId = iosId || Application.applicationId || '';
            } else {
                uniqueId = Application.applicationId || '';
            }

            const deviceName = (await Device.deviceName) || '';
            const modelName = Device.modelName || '';

            const deviceId = `${uniqueId}-${deviceName}-${modelName}`.replace(/\s+/g, '-').toLowerCase();

            if (!deviceId) {
                throw new Error('Failed to generate device ID');
            }

            return deviceId;
        } catch (error) {
            console.error('AnonymousService: Error generating device ID:', error);
            throw error;
        }
    }

    /**
     * Получение или создание идентификатора устройства
     */
    private async getDeviceId(): Promise<string> {
        try {
            console.debug('AnonymousService: Getting device ID...');
            const deviceId = await storage.get<string>(this.DEVICE_ID_KEY);

            if (!deviceId) {
                const newDeviceId = await this.generateDeviceId();
                await storage.set(this.DEVICE_ID_KEY, newDeviceId);
                return newDeviceId;
            }

            return deviceId;
        } catch (error) {
            console.error('AnonymousService: Error getting device ID:', error);
            throw error;
        }
    }

    /**
     * Получение данных об устройстве
     */
    private async getDeviceInfo() {
        const deviceId = await this.getDeviceId();

        return {
            device_id: deviceId,
            environment: __DEV__ ? 'development' : 'production',
            is_expo_go: Constants.appOwnership === 'expo',
            app_version: Constants.expoVersion,
            platform: Platform.OS,
            platform_version: Platform.Version,
        };
    }

    /**
     * Создание анонимного пользователя
     */
    async createAnonymousUser(): Promise<AnonymousResponse> {
        try {
            console.debug('AnonymousService: Creating anonymous user...');
            const deviceInfo = await this.getDeviceInfo();

            const response = await apiClient.post<AnonymousResponse>(API_ROUTES.AUTH.ANONYMOUS.CREATE, deviceInfo);

            if (!response.tokens || !response.tokens.access || !response.tokens.refresh) {
                throw new Error('Invalid token data received from server');
            }

            // Преобразуем токены в нужный формат
            const tokens: AuthTokensType = {
                access: response.tokens.access,
                refresh: response.tokens.refresh,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000 * 30, // 30 дней
            };

            // Сохраняем токены
            await tokenService.setSession(tokens);

            // Сохраняем данные пользователя
            await storage.set(this.ANONYMOUS_USER_KEY, response.user);

            return {
                user: response.user,
                tokens,
            };
        } catch (error) {
            console.error('AnonymousService: Failed to create anonymous user:', error);
            throw error;
        }
    }

    /**
     * Получение или создание анонимного пользователя
     */
    async getOrCreateAnonymousUser(): Promise<AnonymousResponse> {
        try {
            console.debug('AnonymousService: Getting or creating anonymous user...');

            // Проверяем существующего пользователя
            const existingUser = await storage.get<UserType>(this.ANONYMOUS_USER_KEY);
            const session = await tokenService.getSession();

            if (existingUser && session) {
                console.log('AnonymousService: Found existing anonymous user', existingUser);
                return { user: existingUser, tokens: session };
            }

            console.debug('AnonymousService: No existing anonymous user found');
            // Если нет пользователя или сессии, создаем нового
            return await this.createAnonymousUser();
        } catch (error) {
            console.error('AnonymousService: Error in getOrCreateAnonymousUser:', error);
            throw error;
        }
    }

    /**
     * Конвертация анонимного пользователя в зарегистрированного
     */
    async convertToRegisteredUser(data: Partial<UserType>): Promise<AnonymousResponse> {
        try {
            console.debug('AnonymousService: Converting to registered user...');

            // Получаем текущего анонимного пользователя
            const currentUser = await storage.get<UserType>(this.ANONYMOUS_USER_KEY);
            if (!currentUser?.id) {
                throw new Error('No anonymous user found');
            }

            // Конвертируем пользователя
            const response = await apiClient.post<AnonymousResponse>(API_ROUTES.AUTH.ANONYMOUS.CONVERT, {
                ...data,
                anonymous_id: currentUser.id,
            });

            // Обновляем токены и данные пользователя
            await tokenService.setSession(response.tokens);
            await storage.remove(this.ANONYMOUS_USER_KEY);
            await storage.set('user-data', response.user);

            console.debug('AnonymousService: User converted successfully');
            return response;
        } catch (error) {
            console.error('AnonymousService: Failed to convert user:', error);
            throw error;
        }
    }

    /**
     * Проверка, является ли текущий пользователь анонимным
     */
    async isAnonymous(): Promise<boolean> {
        try {
            const user = await storage.get<UserType>(this.ANONYMOUS_USER_KEY);
            return !!user && !user.email;
        } catch {
            return false;
        }
    }
}

export const anonymousUserService = new AnonymousUserService();
