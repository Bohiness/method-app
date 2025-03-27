// src/shared/lib/user/token/token.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';

interface ServerResponse {
    user: any;
    tokens: AuthTokensType;
}

class TokenService {
    private readonly SESSION_KEY = STORAGE_KEYS.USER.USER_SESSION;
    private readonly CSRF_TOKEN_KEY = STORAGE_KEYS.USER.CSRF_TOKEN;

    async getCsrfToken(): Promise<string | null> {
        try {
            const csrfToken = await this.getCsrfTokenFromStorage();

            if (!csrfToken) {
                return await this.getCsrfTokenFromServerAndSaveToStorage();
            }

            return csrfToken;
        } catch (error) {
            logger.error(error, 'token service – getCsrfToken', 'Error getting CSRF token:');
            return null;
        }
    }

    async getCsrfTokenFromStorage(): Promise<string> {
        try {
            const csrfToken = await storage.get<string>(this.CSRF_TOKEN_KEY, true);
            if (!csrfToken) {
                throw new Error('No CSRF token found');
            }
            return csrfToken;
        } catch (error) {
            logger.error(error, 'token service – getCsrfToken', 'Error getting CSRF token:');
            throw error;
        }
    }

    async setCsrfTokenToStorage(csrfToken: string): Promise<void> {
        try {
            await storage.set(this.CSRF_TOKEN_KEY, csrfToken);
        } catch (error) {
            logger.error(error, 'token service – setCsrfToken', 'Error setting CSRF token:');
        }
    }

    async getCsrfTokenFromServerAndSaveToStorage(): Promise<string | null> {
        try {
            logger.start('Getting CSRF token...', 'token service – getCsrfToken');

            const csrfTokenResponse = await apiClient.get<{ csrfToken: string }>(API_ROUTES.AUTH.CSRF_TOKEN);

            if (!csrfTokenResponse?.csrfToken) {
                logger.error('No CSRF token in response', 'token service – getCsrfToken');
                return null;
            }

            await this.setCsrfTokenToStorage(csrfTokenResponse.csrfToken);

            logger.finish('CSRF token saved successfully', 'token service – getCsrfToken');

            return csrfTokenResponse.csrfToken;
        } catch (error) {
            logger.error(error, 'auth-api service – getCsrfToken', 'Error getting CSRF token:');
            return null;
        }
    }

    /**
     * Получение текущей сессии
     */
    async getSession(): Promise<AuthTokensType | null> {
        try {
            logger.debug('TokenService: Getting session...', 'token service – getSession');
            const session = await storage.get<AuthTokensType>(this.SESSION_KEY, true);

            if (!session) {
                logger.debug('TokenService: No session found in storage', 'token service – getSession');
                return null;
            }

            if (!this.isValidSession(session)) {
                logger.warn('TokenService: Session found but invalid (e.g., expired)', 'token service – getSession');
                await this.clearSession();
                return null;
            }

            return session;
        } catch (error) {
            logger.error(error, 'token service – getSession', 'Error getting session:');
            return null;
        }
    }

    /**
     * Установка новой сессии
     */
    async setSession(newTokens: AuthTokensType): Promise<void> {
        try {
            logger.debug('TokenService: Setting new session...', 'token service – setSession');

            const accessTokenExpiresInMs = 24 * 60 * 60 * 1000 * 30; // Example: 30 days - NEEDS REVIEW
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
            const session = await this.getSession();
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
     * Получение refresh токена для обновления
     */
    async getRefreshToken(): Promise<string | null> {
        try {
            const session = await this.getSession();
            return session?.refresh || null;
        } catch (error) {
            logger.error(error, 'token service – getRefreshToken', 'Unexpected error getting refresh token:');
            return null;
        }
    }

    /**
     * Очистка сессии
     */
    async clearSession(): Promise<void> {
        try {
            logger.debug('TokenService: Clearing session...', 'token service – clearSession');
            await storage.remove(this.SESSION_KEY);
            logger.debug('TokenService: Session cleared successfully', 'token service – clearSession');
        } catch (error) {
            logger.error(error, 'token service – clearSession', 'Error clearing session:');
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
