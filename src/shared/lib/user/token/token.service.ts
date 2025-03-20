// src/shared/lib/user/token/token.service.ts
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';

interface ServerResponse {
    user: any;
    tokens: AuthTokensType;
}

class TokenService {
    private readonly SESSION_KEY = 'user-session';
    /**
     * Получение текущей сессии
     */
    async getSession(): Promise<AuthTokensType | null> {
        try {
            logger.debug('TokenService: Getting session...', 'token service – getSession');
            const session = await storage.get<AuthTokensType>(this.SESSION_KEY, true);

            if (!this.isValidSession(session)) {
                logger.debug('TokenService: No session found', 'token service – getSession');
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
