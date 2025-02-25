// src/features/auth/hooks/useGoogleAuth.ts
import { socialAuthService } from '@shared/lib/user/social-auth.service';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
    const config = {
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    };

    const [request, response, promptAsync] = Google.useAuthRequest(config);

    const signIn = async () => {
        try {
            if (Platform.OS === 'web') {
                throw new Error('Web platform is not supported yet');
            }

            const result = await promptAsync();

            if (result?.type === 'success') {
                const { access_token } = result.params;
                return await socialAuthService.handleGoogleAuth(access_token);
            }

            throw new Error('Google sign in was cancelled or failed');
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    return { signIn };
};
