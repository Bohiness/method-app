// src/features/auth/hooks/useGoogleAuth.ts
import { logger } from '@shared/lib/logger/logger.service';
import { socialAuthService } from '@shared/lib/user/social-auth.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';
import { UserType } from '@shared/types/user/UserType';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResponse {
    user: UserType;
    tokens: AuthTokensType;
}

interface GoogleTokensResponse {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
}

export const useGoogleAuth = () => {
    // Получение URL схемы для редиректа
    const redirectUri = Platform.select({
        ios: 'com.anonymous.methodapp://',
        android: 'com.anonymous.methodapp://',
        default: 'com.anonymous.methodapp://',
    });

    // Настраиваем конфигурацию для использования code flow (authorization_code)
    const config = {
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        scopes: ['profile', 'email'],
        redirectUri,
        responseType: 'code',
        usePKCE: true,
    };

    // Используем хук useAuthRequest из expo-auth-session
    const [request, response, promptAsync] = Google.useAuthRequest(config);

    // Состояния для отслеживания процесса авторизации
    const [isProcessingAuth, setIsProcessingAuth] = useState(false);
    const [authResult, setAuthResult] = useState<GoogleAuthResponse | null>(null);
    const [authError, setAuthError] = useState<Error | null>(null);

    // Эффект для обработки ответа от Google Auth
    useEffect(() => {
        const processAuthResponse = async () => {
            if (response?.type === 'success' && !isProcessingAuth) {
                try {
                    setIsProcessingAuth(true);
                    setAuthError(null);

                    // Здесь мы получаем либо код, либо токены напрямую
                    if (response.params.code) {
                        // Вариант 1: Получен код авторизации
                        const { code } = response.params;
                        logger.info('Received authorization code from Google', 'useGoogleAuth');

                        // Убедимся, что redirectUri не undefined
                        const finalRedirectUri = redirectUri;
                        logger.info(`Using redirectUri: ${finalRedirectUri}`, 'useGoogleAuth');

                        try {
                            // Отправляем код на сервер
                            const result = await socialAuthService.handleGoogleAuthCode(code, finalRedirectUri);
                            setAuthResult(result);
                            logger.info('Google auth with code complete', 'useGoogleAuth');
                            return result;
                        } catch (codeError) {
                            logger.error(codeError as Error, 'Error with code authentication on server');
                            throw codeError;
                        }
                    } else if (response.params.access_token || response.authentication?.accessToken) {
                        // Вариант 2: Получены токены напрямую
                        const accessToken = response.params.access_token || response.authentication?.accessToken;
                        const idToken = response.params.id_token || response.authentication?.idToken;
                        const refreshToken = response.params.refresh_token;
                        const expiresIn = response.params.expires_in || 3600;

                        if (!accessToken || !idToken) {
                            throw new Error('Access token or ID token not received from Google');
                        }

                        logger.info('Received tokens directly from Google', 'useGoogleAuth');

                        // Формируем объект с токенами
                        const googleTokens: GoogleTokensResponse = {
                            access_token: accessToken,
                            id_token: idToken,
                            refresh_token: refreshToken,
                            token_type: 'Bearer',
                            expires_in: Number(expiresIn),
                        };

                        try {
                            // Отправляем токены на сервер для авторизации
                            const result = await socialAuthService.handleGoogleTokensDirectly(googleTokens);
                            setAuthResult(result);
                            logger.info('Google auth with tokens complete', 'useGoogleAuth');
                            return result;
                        } catch (tokenError) {
                            logger.error(tokenError as Error, 'Error with token authentication on server');
                            throw tokenError;
                        }
                    } else {
                        // Ни код, ни токены не получены
                        throw new Error('Neither authorization code nor tokens received from Google');
                    }
                } catch (error) {
                    logger.error(error as Error, 'Error processing Google auth response');
                    setAuthError(error as Error);
                    throw error;
                } finally {
                    setIsProcessingAuth(false);
                }
            }
            return null;
        };

        processAuthResponse().catch(error => {
            console.error('Error in auth response processing:', error);
        });
    }, [response, redirectUri]);

    const signIn = async () => {
        try {
            if (Platform.OS === 'web') {
                throw new Error('Web platform is not supported yet');
            }

            setAuthError(null);
            setAuthResult(null);

            logger.info('Starting Google auth flow', 'useGoogleAuth');
            logger.info(`Using redirect URI: ${redirectUri}`, 'useGoogleAuth');

            // Запускаем процесс аутентификации с Google через библиотеку expo-auth-session
            const promptResult = await promptAsync();

            if (promptResult.type !== 'success') {
                const error = new Error(`Google sign in failed: ${promptResult.type}`);
                setAuthError(error);
                throw error;
            }

            return promptResult;
        } catch (error) {
            logger.error(error as Error, 'Error signing in with Google');
            setAuthError(error as Error);
            throw error;
        }
    };

    return {
        signIn,
        authResult,
        authError,
        isProcessingAuth,
    };
};
