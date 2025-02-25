// src/features/auth/hooks/useAppleAuth.ts
import { socialAuthService } from '@shared/lib/user/social-auth.service';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const useAppleAuth = () => {
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'ios') {
            AppleAuthentication.isAvailableAsync().then(setIsAvailable);
        }
    }, []);

    const signIn = async () => {
        try {
            if (!isAvailable) {
                throw new Error('Apple Sign In is not available');
            }

            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            return await socialAuthService.handleAppleAuth(credential);
        } catch (error) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                throw new Error('Apple sign in was cancelled');
            }
            console.error('Error signing in with Apple:', error);
            throw error;
        }
    };

    return {
        isAvailable,
        signIn,
    };
};
