// src/shared/api/auth/auth.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { csrfService } from '@shared/lib/user/token/csrf.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import { userService } from '@shared/lib/user/user.service';
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
            logger.debug(response, 'AuthService: Login response:');
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

    /**
     * @deprecated Эта функция НЕ проверяет аутентификацию на сервере.
     * Она загружает ПОТЕНЦИАЛЬНО УСТАРЕВШИЕ данные сессии, пользователя и CSRF из локального хранилища.
     * Использовать только для получения кэшированных данных, если сервер недоступен или для очень быстрой начальной отрисовки.
     * НЕ ИСПОЛЬЗОВАТЬ для принятия решений об аутентификации пользователя.
     * Используйте `checkAuthFromServer` для надежной проверки.
     */
    async checkAuthFromStorage(): Promise<Partial<CheckAuthResponse>> {
        logger.warn('Using deprecated checkAuthFromStorage. Data might be stale.', 'auth-api - checkAuthFromStorage');
        let session: AuthTokensType | null = null;
        let userData: UserType | null = null;
        let csrfToken: string | null = null;

        try {
            session = await tokenService.getTokensFromStorage(); // Может вернуть null или истекшую сессию
        } catch (e) {
            logger.error(e, 'auth-api - checkAuthFromStorage', 'Failed to get session from storage');
        }

        try {
            userData = await storage.get<UserType>(STORAGE_KEYS.USER.USER_DATA);
        } catch (e) {
            logger.error(e, 'auth-api - checkAuthFromStorage', 'Failed to get user data from storage');
        }

        try {
            // Используем getCsrfTokenFromStorage, чтобы не триггерить запрос к серверу, если токена нет
            csrfToken = await csrfService.getCsrfTokenFromStorage();
        } catch (e) {
            /* Ошибка уже логируется внутри getCsrfTokenFromStorage */
        }

        // Возвращаем то, что удалось загрузить.
        // is_authenticated здесь не устанавливаем, т.к. мы не знаем реальный статус.
        return {
            // is_authenticated: undefined, // Явно не устанавливаем статус
            userData: userData ?? undefined, // Возвращаем userData или undefined
            csrfToken: csrfToken ?? undefined, // Возвращаем csrfToken или undefined
        };
    }

    /**
     * Проверяет текущую сессию пользователя на сервере.
     * Возвращает актуальные данные пользователя и CSRF-токен при успехе.
     * @returns {Promise<CheckAuthResponse>} Ответ сервера.
     * @throws {AxiosError} Если сессия недействительна, отсутствует или произошла ошибка сети/сервера.
     */
    async checkAuthFromServer(): Promise<CheckAuthResponse> {
        try {
            // apiClient выполнит запрос GET /api/auth/check/
            // Интерцепторы apiClient обработают CSRF и обновление токенов при необходимости.
            const response = await apiClient.get<CheckAuthResponse>(API_ROUTES.AUTH.CHECK_AUTH);
            logger.debug('AuthService: Server auth check successful');
            return response;
        } catch (error: any) {
            // Логируем ошибку (уже делается в handleError apiClient, но можно добавить контекст)
            logger.error(error, 'auth-api – checkAuthFromServer', 'AuthService: Server auth check failed:');
            // Пробрасываем ошибку дальше, чтобы вызывающий код (UserProvider) мог ее обработать
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            logger.debug('AuthService: Logging out...');
            await apiClient.post(API_ROUTES.AUTH.LOGOUT);
        } catch (error) {
            logger.error(error, 'auth-api – logout', 'AuthService: Logout request failed:');
            // Continue clearing session even if API call fails
        } finally {
            logger.debug('AuthService: Clearing session data...');
            // Use tokenService.clearSession() which now also clears CSRF
            await tokenService.clearRefreshAndAccessTokens();
            // Clear user data separately as it's not handled by tokenService
            await userService.clearUserFromStorage();
            logger.debug('AuthService: Session data cleared successfully');
            logger.debug('AuthService: Reloading the app after logout...');
            await Updates.reloadAsync();
        }
    }

    private async saveSession(response: AuthResponse): Promise<void> {
        try {
            logger.debug('AuthService: Saving tokens, user data, and CSRF token...');

            if (!response.tokens?.access || !response.tokens?.refresh) {
                logger.error(
                    'Invalid tokens in response', // Simplified message
                    'auth-api – saveSession',
                    'AuthService: Invalid tokens in response'
                );
                throw new Error('Invalid authentication response: missing tokens');
            }
            // CSRF token is handled by apiClient interceptor via Set-Cookie header.
            // Removed check for response.csrfToken in the body.

            // Save tokens using tokenService
            await tokenService.setTokensToStorage(response.tokens);
            logger.debug('AuthService: Tokens saved successfully via tokenService');

            // Save user data
            await userService.setUserToStorage(response.user);
            logger.debug('AuthService: User data saved successfully');
        } catch (error) {
            logger.error(error, 'auth-api – saveSession', 'AuthService: Failed to save session:');
            throw error; // Re-throw the error
        }
    }
}

export const authApiService = new AuthApiService();
