// src/features/auth/social-auth.service.ts
import { apiClient } from '@shared/config/api-client';
import { storage } from '@shared/lib/storage/storage.service';
import { tokenService } from '@shared/lib/user/token/token.service';
import { AuthTokensType } from '@shared/types/user/AuthTokensType';
import { UserType } from '@shared/types/user/UserType';
import * as AppleAuthentication from 'expo-apple-authentication';

interface SocialAuthResponse {
    user: UserType;
    tokens: AuthTokensType;
}

class SocialAuthService {
    async handleGoogleAuth(accessToken: string): Promise<SocialAuthResponse> {
        try {
            const authResponse = await apiClient.post<SocialAuthResponse>('/api/v2/auth/social/google/', {
                token: accessToken,
            });

            await this.saveAuthData(authResponse);
            return authResponse;
        } catch (error) {
            console.error('Error handling Google auth:', error);
            throw error;
        }
    }

    async handleAppleAuth(credential: AppleAuthentication.AppleAuthenticationCredential): Promise<SocialAuthResponse> {
        try {
            const authResponse = await apiClient.post<SocialAuthResponse>('/api/v2/auth/social/apple/', {
                identityToken: credential.identityToken,
                authorizationCode: credential.authorizationCode,
                user: {
                    email: credential.email,
                    fullName: credential.fullName,
                },
            });

            await this.saveAuthData(authResponse);
            return authResponse;
        } catch (error) {
            console.error('Error handling Apple auth:', error);
            throw error;
        }
    }

    private async saveAuthData(response: SocialAuthResponse): Promise<void> {
        try {
            await tokenService.setSession(response.tokens);
            await storage.set('user-data', response.user);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw error;
        }
    }
}

export const socialAuthService = new SocialAuthService();
