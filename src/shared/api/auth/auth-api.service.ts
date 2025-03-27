// src/shared/api/auth/auth.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import { AuthTokensType, CheckAuthResponse } from '@shared/types/user/AuthTokensType';
import { UserType } from '@shared/types/user/UserType';
import * as Updates from 'expo-updates';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

interface AuthResponse {
    user: UserType;
    tokens: AuthTokensType;
    csrfToken: string;
}

export interface CheckEmailResponse {
    status?: 'error' | 'register' | 'login';
    message?: string;
    password?: boolean;
    name?: string;
    has_expert?: boolean;
}

export class AuthApiService {
    async checkEmail(email: string): Promise<CheckEmailResponse> {
        try {
            const response = await apiClient.post<CheckEmailResponse>(API_ROUTES.AUTH.CHECK_EMAIL, { email });
            return response;
        } catch (error) {
            logger.error(error, 'auth-api – checkEmail', 'AuthService: Error checking email:');
            throw error;
        }
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            logger.debug('AuthService: Attempting login...');
            const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);

            logger.debug('AuthService: Login successful, saving session...');
            await this.saveSession(response);

            return response;
        } catch (error) {
            logger.error(error, 'auth-api – login', 'AuthService: Login failed:');
            throw error;
        }
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            logger.debug('AuthService: Attempting registration...');
            const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);

            logger.debug('AuthService: Registration successful, saving session...');
            await this.saveSession(response);

            return response;
        } catch (error) {
            logger.error(error, 'auth-api – register', 'AuthService: Registration failed:');
            throw error;
        }
    }

    async checkAuthFromStorage(): Promise<CheckAuthResponse> {
        const session = await tokenService.getSession();

        if (!session) {
            throw new Error('No active session');
        }

        const userData = await storage.get<UserType>(STORAGE_KEYS.USER.USER_DATA);

        if (!userData) {
            throw new Error('No user data in storage');
        }

        const csrfToken = await tokenService.getCsrfToken();

        if (!csrfToken) {
            throw new Error('No CSRF token in storage');
        }

        return {
            is_authenticated: true,
            userData: userData,
            csrfToken: csrfToken,
        };
    }

    async checkAuthFromServer(): Promise<CheckAuthResponse> {
        try {
            const response = await apiClient.get<CheckAuthResponse>(API_ROUTES.AUTH.CHECK_AUTH);
            logger.debug('AuthService: Auth check successful');

            return response;
        } catch (error: any) {
            logger.error(error, 'auth-api – checkAuthFromServer', 'AuthService: Auth check failed:');
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            logger.debug('AuthService: Logging out...');
            await apiClient.post(API_ROUTES.AUTH.LOGOUT);
        } catch (error) {
            logger.error(error, 'auth-api – logout', 'AuthService: Logout request failed:');
            // Продолжаем очистку даже при ошибке запроса
        } finally {
            logger.debug('AuthService: Clearing session...');
            await this.clearSession();
            logger.debug('AuthService: Reloading the app after logout...');
            await Updates.reloadAsync();
        }
    }

    private async saveSession(response: AuthResponse): Promise<void> {
        try {
            logger.debug('AuthService: Saving tokens and user data...');

            // Проверяем наличие токенов
            if (!response.tokens?.access || !response.tokens?.refresh) {
                logger.error(
                    'AuthService: Invalid tokens in response',
                    'auth-api – saveSession',
                    'AuthService: Invalid tokens in response'
                );
                throw new Error('Invalid authentication response');
            }

            // Сначала сохраняем токены
            await tokenService.setSession(response.tokens);
            logger.debug('AuthService: Tokens saved successfully');

            // Затем сохраняем данные пользователя
            await storage.set(STORAGE_KEYS.USER.USER_DATA, response.user);
            await storage.set(STORAGE_KEYS.USER.CSRF_TOKEN, response.csrfToken);

            logger.debug('AuthService: User data saved successfully');
        } catch (error) {
            logger.error(error, 'auth-api – saveSession', 'AuthService: Failed to save session:');
            await this.clearSession();
            throw error;
        }
    }

    private async clearSession(): Promise<void> {
        try {
            logger.debug('AuthService: Clearing all session data...');
            await Promise.all([tokenService.clearSession(), storage.remove('user-data')]);
            logger.debug('AuthService: Session cleared successfully');
        } catch (error) {
            logger.error(error, 'auth-api – clearSession', 'AuthService: Error clearing session:');
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            logger.debug('AuthService: Refreshing token...');
            const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.REFRESH_TOKEN, {
                refresh: refreshToken,
            });
            return response;
        } catch (error) {
            logger.error(error, 'auth-api – refreshToken', 'AuthService: Error refreshing token:');
            throw error;
        }
    }

    /**
     * Обновление токенов
     * Этот метод используется ApiClient для обновления токенов
     */
    async refreshTokens(): Promise<AuthTokensType> {
        try {
            logger.debug('AuthService: Starting token refresh...');
            const refreshToken = await tokenService.getRefreshToken();

            if (!refreshToken) {
                logger.error('AuthService: No refresh token available for refresh');
                throw new Error('No refresh token available');
            }

            const response = await this.refreshToken(refreshToken);

            const tokens: AuthTokensType = {
                access: response.tokens.access,
                refresh: response.tokens.refresh,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000 * 30,
            };

            await tokenService.setSession({
                access: tokens.access,
                refresh: tokens.refresh,
            });

            return tokens;
        } catch (error) {
            logger.error(error, 'auth-api – refreshTokens', 'AuthService: Error refreshing tokens:');
            await tokenService.clearSession();
            throw error;
        }
    }

    /**
     * Получает CSRF-токен.
     * @returns {Promise< string | null >} CSRF-токен или null, если не найден.
     */
    async getCsrfToken(): Promise<string | null> {
        // TODO: Implement actual CSRF token retrieval logic
        // Например, получить его из хранилища или сделать запрос к API
        logger.debug('Retrieving CSRF token...', 'getCsrfToken - AuthApiService');
        // Placeholder:
        const token = null; // Замени на реальную логику
        if (!token) {
            logger.warn('CSRF token not found', 'getCsrfToken - AuthApiService');
        }
        return token;
    }
}

export const authApiService = new AuthApiService();
