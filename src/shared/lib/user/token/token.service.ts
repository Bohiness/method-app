// src/shared/lib/user/token/token.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';
import { userService } from '../user.service';

class TokenService {
    private readonly SESSION_KEY = STORAGE_KEYS.USER.USER_SESSION;
    private readonly CSRF_TOKEN_KEY = STORAGE_KEYS.USER.CSRF_TOKEN;

    /**
     * Получение текущих токенов из storage
     * @returns {AuthTokensType | null}
     */
    async getTokensFromStorage(): Promise<AuthTokensType | null> {
        try {
            logger.debug('TokenService: Getting session...', 'token service – getSession');
            const session = await storage.get<AuthTokensType>(this.SESSION_KEY, true);

            if (!session) {
                logger.debug('TokenService: No session found in storage', 'token service – getSession');
                return null;
            }

            if (!this.isValidSession(session)) {
                logger.warn('TokenService: Session found but invalid (e.g., expired)', 'token service – getSession');
                await this.clearRefreshAndAccessTokens();
                return null;
            }

            return session;
        } catch (error) {
            logger.error(error, 'token service – getSession', 'Error getting session:');
            return null;
        }
    }

    /**
     * Установка новых токенов в storage
     * @param {AuthTokensType} newTokens - Новые токены
     * @returns {void}
     */
    async setTokensToStorage(newTokens: AuthTokensType): Promise<void> {
        try {
            logger.debug('TokenService: Setting new session...', 'token service – setSession');

            const accessTokenExpiresInMs = 24 * 60 * 60 * 1000 * 30; // 30 days
            const expiresAt = Date.now() + accessTokenExpiresInMs;

            const tokens: AuthTokensType = {
                access: newTokens.access,
                refresh: newTokens.refresh,
                expiresAt: expiresAt,
            };

            if (!tokens.access || !tokens.refresh) {
                logger.error('TokenService: Invalid token data provided', 'token service – setSession');
                throw new Error('Invalid token data');
            }

            await storage.set(this.SESSION_KEY, tokens, true);
            logger.debug('TokenService: Session set successfully', 'token service – setSession');
        } catch (error) {
            logger.error(error, 'token service – setSession', 'Error setting session:');
            throw error;
        }
    }

    /**
     * Проверка необходимости обновления токена
     */
    async shouldRefreshToken(): Promise<boolean> {
        try {
            const session = await this.getTokensFromStorage();
            if (!session) {
                logger.debug('No valid session, refresh needed (or login)', 'token service – shouldRefreshToken');
                return true;
            }

            const bufferTime = 60 * 1000;
            const needsRefresh =
                !session.access || (session.expiresAt ? Date.now() + bufferTime >= session.expiresAt : true);

            if (needsRefresh) {
                logger.debug(
                    `Refresh needed. ExpiresAt: ${session.expiresAt}, Now: ${Date.now()}`,
                    'token service – shouldRefreshToken'
                );
            }

            return needsRefresh;
        } catch (error) {
            logger.error(error, 'token service – shouldRefreshToken', 'Unexpected error checking refresh:');
            return true;
        }
    }

    /**
     * Получение refresh токена для обновления с сервера
     * @returns {AuthTokensType['refresh'] | null}
     */
    async getRefreshToken(): Promise<AuthTokensType['refresh'] | null> {
        try {
            const tokens = await this.getTokensFromStorage();
            return tokens?.refresh || null;
        } catch (error) {
            logger.error(error, 'token service – getRefreshToken', 'Unexpected error getting refresh token:');
            return null;
        }
    }

    /**
     * Очистка refresh и access токенов
     * @returns {void}
     */
    async clearRefreshAndAccessTokens(): Promise<void> {
        try {
            logger.debug(
                'TokenService: Clearing refresh and access tokens...',
                'token service – clearRefreshAndAccessTokens'
            );
            await storage.remove(this.SESSION_KEY);
            logger.debug(
                'TokenService: Refresh and access tokens cleared successfully',
                'token service – clearRefreshAndAccessTokens'
            );
        } catch (error) {
            logger.error(
                error,
                'token service – clearRefreshAndAccessTokens',
                'Error clearing refresh and access tokens:'
            );
            throw error;
        }
    }

    /**
     * Получает новый access токен с сервера
     * @param {string} refreshToken - refresh токен
     * @returns {Promise<AuthTokensType['access']>} Новый access токен
     * @throws {AxiosError} Если токен недействителен или произошла ошибка сети/сервера
     */
    async getNewAccessTokenFromServer(refreshToken: AuthTokensType['refresh']): Promise<AuthTokensType['access']> {
        try {
            logger.debug('AuthService: Refreshing token...');
            const response = await apiClient.post<{ tokens: AuthTokensType }>(API_ROUTES.AUTH.TOKENS.REFRESH, {
                refresh: refreshToken,
            });
            return response.tokens.access;
        } catch (error) {
            logger.error(error, 'auth-api – refreshToken', 'AuthService: Error refreshing token:');
            throw error;
        }
    }
    /**
     * Проверяет access токен на сервере
     * @param {string} accessToken - access токен
     * @returns {Promise<boolean>} true, если токен действителен, false - иначе
     */
    async checkAccessTokenOnServer(accessToken: AuthTokensType['access']): Promise<boolean> {
        try {
            // Этот метод возвращает только 200 статус и пустой ответ
            await apiClient.post(API_ROUTES.AUTH.TOKENS.VALIDATE, {
                access: accessToken,
            });

            // Если запрос успешен (нет ошибки), значит токен действителен
            return true;
        } catch (error) {
            logger.error(error, 'auth-api – checkAccessTokenOnServer', 'AuthService: Error checking access token:');
            return false;
        }
    }

    /**
     * Обновление токенов
     * Этот метод используется ApiClient для обновления токенов
     */
    async getNewAccessToken(): Promise<AuthTokensType['access']> {
        try {
            logger.debug('AuthService: Starting token refresh...', 'auth-api - refreshTokens');
            const refreshToken = await this.getRefreshToken();

            if (!refreshToken) {
                logger.error('No refresh token available for refresh', 'auth-api - refreshTokens');
                throw new Error('No refresh token available');
            }

            // Call the API to get new tokens + potentially new CSRF
            const newAccessToken = await this.getNewAccessTokenFromServer(refreshToken);

            // The response should contain the new tokens and potentially a new CSRF token
            if (!newAccessToken) {
                logger.error('Invalid tokens received during refresh', 'auth-api - refreshTokens');
                throw new Error('Invalid tokens received during refresh');
            }

            // Save the new session (tokens) using tokenService
            // tokenService.setSession will handle expiry calculation
            await this.setTokensToStorage({
                access: newAccessToken,
                refresh: refreshToken,
            });

            // Removed checking/saving CSRF token from refresh response body.
            // It should be handled by the apiClient interceptor via Set-Cookie header if backend sends it.
            logger.debug(
                'CSRF token (if sent by backend) is handled by apiClient interceptor',
                'auth-api - refreshTokens'
            );

            // Return only the tokens as per the original method signature
            // The AuthTokensType from tokenService.setSession might not have expiresAt if not needed here
            return newAccessToken;
        } catch (error) {
            logger.error(error, 'auth-api – refreshTokens', 'AuthService: Error refreshing tokens:');
            // Clear session on refresh failure
            await this.clearRefreshAndAccessTokens();
            await userService.clearUserFromStorage();
            throw error;
        }
    }

    /**
     * Проверка валидности сессии
     */
    private isValidSession(session: AuthTokensType | null): boolean {
        if (!session || !session.access || !session.refresh) {
            return false;
        }

        if (session.expiresAt && Date.now() >= session.expiresAt) {
            logger.debug(`Session invalid: expired at ${session.expiresAt}`, 'token service - isValidSession');
            return false;
        }

        return true;
    }
}

export const tokenService = new TokenService();
