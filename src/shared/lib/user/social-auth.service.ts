// src/features/auth/social-auth.service.ts
import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { logger } from '@shared/lib/logger/logger.service';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';
import { UserType } from '@shared/types/user/UserType';

interface SocialAuthResponse {
    user: UserType;
    tokens: AuthTokensType;
}

interface GoogleTokens {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
}

// Фиксированный URL для мобильного колбэка
const GOOGLE_MOBILE_CALLBACK_URL = API_ROUTES.AUTH.GOOGLE_AUTH_CALLBACK;

class SocialAuthService {
    async handleGoogleAuth(accessToken: string): Promise<SocialAuthResponse> {
        try {
            const authResponse = await apiClient.post<SocialAuthResponse>(API_ROUTES.AUTH.GOOGLE_AUTH, {
                token: accessToken,
            });

            logger.info('Google auth successful response', 'social-auth-service');

            await this.saveAuthData(authResponse);
            return authResponse;
        } catch (error) {
            logger.error(error as Error, 'Error handling Google auth in social-auth.service');
            console.error('Error handling Google auth:', error);
            throw error;
        }
    }

    async handleGoogleAuthCode(code: string, redirectUri: string): Promise<SocialAuthResponse> {
        try {
            logger.info(`Sending code to server: ${code.substring(0, 10)}...`, 'social-auth-service');
            logger.info(`Redirect URI: ${redirectUri}`, 'social-auth-service');

            // Вывод полной информации для отладки
            logger.log('Google Auth Code:', code);
            logger.log('Redirect URI:', redirectUri);
            logger.log('Mobile Callback URL:', GOOGLE_MOBILE_CALLBACK_URL);

            // Отправляем код непосредственно на новый мобильный endpoint
            const authResponse = await apiClient.post<SocialAuthResponse>(GOOGLE_MOBILE_CALLBACK_URL, {
                code,
                redirect_uri:
                    'com.googleusercontent.apps.179295677158-8lckmjr8mfutc1ris5dkJpnftq5ugpu5:/oauth2callback',
            });

            // Проверяем полный ответ от сервера
            logger.json(authResponse, { title: 'Server response:' });

            if (!authResponse || !authResponse.tokens || !authResponse.user) {
                const errorMsg = 'Invalid response from server: ' + JSON.stringify(authResponse);
                logger.error(new Error(errorMsg), 'Invalid response structure');
                throw new Error(errorMsg);
            }

            logger.info('Google auth code successful response', 'social-auth-service');
            logger.info(`User data received: ${JSON.stringify(authResponse.user, null, 2)}`, 'social-auth-service');

            await this.saveAuthData(authResponse);
            return authResponse;
        } catch (error) {
            logger.error(error as Error, 'Error handling Google auth code in social-auth.service');
            logger.error(error, 'Error handling Google auth code:');
            throw error;
        }
    }

    async handleGoogleTokensDirectly(googleTokens: GoogleTokens): Promise<SocialAuthResponse> {
        try {
            logger.info('Handling Google tokens directly', 'social-auth-service');

            // Вывод информации о токенах для отладки
            logger.log('ID Token (partial):', googleTokens.id_token.substring(0, 20) + '...');
            logger.log('Access Token (partial):', googleTokens.access_token.substring(0, 20) + '...');

            // Отправляем токены на мобильный endpoint
            const authResponse = await apiClient.post<SocialAuthResponse>(GOOGLE_MOBILE_CALLBACK_URL, {
                id_token: googleTokens.id_token,
                access_token: googleTokens.access_token,
            });

            if (!authResponse || !authResponse.tokens || !authResponse.user) {
                throw new Error('Invalid response from server');
            }

            logger.info('Google tokens authentication successful', 'social-auth-service');

            await this.saveAuthData(authResponse);
            return authResponse;
        } catch (error) {
            logger.error(error as Error, 'Error handling Google tokens in social-auth.service');
            logger.error(error, 'Error handling Google tokens:');
            throw error;
        }
    }

    private async saveAuthData(response: SocialAuthResponse): Promise<void> {
        try {
            await tokenService.setSession(response.tokens);
            await storage.set('user-data', response.user);
        } catch (error) {
            logger.error(error as Error, 'Error saving auth data in social-auth.service');
            logger.error(error, 'Error saving auth data:');
            throw error;
        }
    }
}

export const socialAuthService = new SocialAuthService();
