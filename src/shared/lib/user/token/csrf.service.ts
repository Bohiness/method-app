import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';

class CsrfService {
    private readonly CSRF_TOKEN_KEY = STORAGE_KEYS.USER.CSRF_TOKEN;

    async getCsrfToken(): Promise<string | null> {
        try {
            const csrfToken = await this.getCsrfTokenFromStorage();
            if (!csrfToken) {
                logger.warn('CSRF token not found in storage', 'token service – getCsrfToken');
                return await this.getCsrfTokenFromServerAndSaveToStorage();
            }
            logger.debug('CSRF token found in storage', 'token service – getCsrfToken');
            return csrfToken;
        } catch (error) {
            logger.warn(
                'CSRF token not found in storage or error reading, fetching from server...',
                'token service – getCsrfToken'
            );
            try {
                return await this.getCsrfTokenFromServerAndSaveToStorage();
            } catch (serverError) {
                logger.error(serverError, 'token service – getCsrfToken', 'Error getting CSRF token from server:');
                return null;
            }
        }
    }

    async getCsrfTokenFromStorage(): Promise<string | null> {
        try {
            const csrfToken = await storage.get<string>(this.CSRF_TOKEN_KEY);
            if (!csrfToken) {
                return null;
            }
            return csrfToken;
        } catch (error) {
            logger.error(error, 'token service – getCsrfTokenFromStorage', 'Error getting CSRF token from storage:');
            throw error;
        }
    }

    async setCsrfTokenToStorage(csrfToken: string): Promise<void> {
        try {
            await storage.set(this.CSRF_TOKEN_KEY, csrfToken);
            logger.debug('CSRF token saved to storage', 'token service – setCsrfTokenToStorage');
        } catch (error) {
            logger.error(error, 'token service – setCsrfTokenToStorage', 'Error setting CSRF token to storage:');
        }
    }

    async clearCsrfToken(): Promise<void> {
        try {
            await storage.remove(this.CSRF_TOKEN_KEY);
            logger.debug('CSRF token cleared from storage', 'token service – clearCsrfToken');
        } catch (error) {
            logger.error(error, 'token service – clearCsrfToken', 'Error clearing CSRF token:');
        }
    }

    async getCsrfTokenFromServerAndSaveToStorage(): Promise<string | null> {
        try {
            logger.start('Getting CSRF token...', 'token service – getCsrfToken');

            const csrfTokenResponse = await apiClient.get<{ csrfToken: string }>(API_ROUTES.AUTH.TOKENS.CSRF_TOKEN);

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
}

export const csrfService = new CsrfService();
