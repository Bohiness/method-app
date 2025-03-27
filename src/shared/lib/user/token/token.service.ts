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
    async getSession(): Promise<AuthTokensType> {
        try {
            logger.debug('TokenService: Getting session...', 'token service – getSession');
            const session = await storage.get<AuthTokensType>(this.SESSION_KEY, true);

            if (!session) {
                logger.debug('TokenService: No session found', 'token service – getSession');
                throw new Error('No session found');
            }

            if (!this.isValidSession(session)) {
                logger.debug('TokenService: No session found', 'token service – getSession');
                throw new Error('No session found');
            }

            return session;
        } catch (error) {
            logger.error(error, 'token service – getSession', 'Error getting session:');
            throw error;
        }
    }

    /**
     * Установка новой сессии
     */
    async setSession(newTokens: AuthTokensType): Promise<void> {
        try {
            logger.debug('TokenService: Setting new session...', 'token service – setSession');

            const tokens: AuthTokensType = {
                access: newTokens.access,
                refresh: newTokens.refresh,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000 * 30, // 30 дней
            };

            if (!tokens.access || !tokens.refresh) {
                logger.error('TokenService: Invalid token data', 'token service – setSession');
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
            if (!session) return true;

            // Добавляем 1 минуту буфера
            const bufferTime = 60 * 1000;
            return !session.access || (session.expiresAt ? Date.now() + bufferTime >= session.expiresAt : false);
        } catch (error) {
            logger.error(error, 'token service – shouldRefreshToken', 'Error checking refresh:');
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
            logger.error(error, 'token service – getRefreshToken', 'Error getting refresh token:');
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
        if (!session?.access || !session?.refresh) return false;

        // Проверяем срок действия, если он установлен
        if (session.expiresAt && Date.now() >= session.expiresAt) {
            return false;
        }

        return true;
    }
}

export const tokenService = new TokenService();
