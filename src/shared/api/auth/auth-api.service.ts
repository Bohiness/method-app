// src/shared/api/auth/auth.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';
import { UserType } from '@shared/types/user/UserType';

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
}

interface CheckAuthResponse {
    csrfToken: string;
    is_authenticated: boolean;
    userData: UserType;
}

export interface CheckEmailResponse {
    status?: 'error' | 'register' | 'login';
    message?: string;
    password?: boolean;
    name?: string;
    has_expert?: boolean;
}

class AuthApiService {
    async checkEmail(email: string): Promise<CheckEmailResponse> {
        try {
            const response = await apiClient.post<CheckEmailResponse>(API_ROUTES.AUTH.CHECK_EMAIL, { email });
            return response;
        } catch (error) {
            throw error;
        }
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            console.debug('AuthService: Attempting login...');
            const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);

            console.debug('AuthService: Login successful, saving session...');
            await this.saveSession(response);

            return response;
        } catch (error) {
            console.error('AuthService: Login failed:', error);
            throw error;
        }
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            console.debug('AuthService: Attempting registration...');
            const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data);

            console.debug('AuthService: Registration successful, saving session...');
            await this.saveSession(response);

            return response;
        } catch (error) {
            console.error('AuthService: Registration failed:', error);
            throw error;
        }
    }

    async checkAuth(): Promise<CheckAuthResponse> {
        try {
            console.debug('AuthService: Checking auth status...');
            // Получаем сессию и проверяем токены
            const session = await tokenService.getSession();
            if (!session) {
                console.debug('AuthService: No session found during auth check');
                throw new Error('No active session');
            }

            // Запрашиваем данные пользователя
            const response = await apiClient.get<CheckAuthResponse>(API_ROUTES.AUTH.CHECK_AUTH);
            console.debug('AuthService: Auth check successful');
            return response;
        } catch (error) {
            console.error('AuthService: Auth check failed:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            console.debug('AuthService: Logging out...');
            await apiClient.post(API_ROUTES.AUTH.LOGOUT);
        } catch (error) {
            console.error('AuthService: Logout request failed:', error);
            // Продолжаем очистку даже при ошибке запроса
        } finally {
            console.debug('AuthService: Clearing session...');
            await this.clearSession();
        }
    }

    private async saveSession(response: AuthResponse): Promise<void> {
        try {
            console.debug('AuthService: Saving tokens and user data...');

            // Проверяем наличие токенов
            if (!response.tokens?.access || !response.tokens?.refresh) {
                console.error('AuthService: Invalid tokens in response');
                throw new Error('Invalid authentication response');
            }

            // Сначала сохраняем токены
            await tokenService.setSession(response.tokens);
            console.debug('AuthService: Tokens saved successfully');

            // Затем сохраняем данные пользователя
            await storage.set('user-data', response.user);
            console.debug('AuthService: User data saved successfully');
        } catch (error) {
            console.error('AuthService: Failed to save session:', error);
            // При ошибке сохранения очищаем всё
            await this.clearSession();
            throw error;
        }
    }

    private async clearSession(): Promise<void> {
        try {
            console.debug('AuthService: Clearing all session data...');
            await Promise.all([tokenService.clearSession(), storage.remove('user-data')]);
            console.debug('AuthService: Session cleared successfully');
        } catch (error) {
            console.error('AuthService: Error clearing session:', error);
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            console.debug('AuthService: Refreshing token...');
            const response = await apiClient.post<AuthResponse>(API_ROUTES.AUTH.REFRESH_TOKEN, {
                refresh: refreshToken,
            });
            return response;
        } catch (error) {
            console.error('AuthService: Error refreshing token:', error);
            throw error;
        }
    }

    /**
     * Обновление токенов
     * Этот метод используется ApiClient для обновления токенов
     */
    async refreshTokens(): Promise<AuthTokensType> {
        try {
            console.debug('AuthService: Starting token refresh...');
            const refreshToken = await tokenService.getRefreshToken();

            if (!refreshToken) {
                console.error('AuthService: No refresh token available for refresh');
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
            console.error('AuthService: Error refreshing tokens:', error);
            await tokenService.clearSession();
            throw error;
        }
    }
}

export const authApiService = new AuthApiService();
