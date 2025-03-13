import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { useUser } from '@shared/context/user-provider'
import { Button } from '@shared/ui/button'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { socialAuthService } from './social-auth.service'

export function WebSignIn() {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)
    const { signOut } = useUser()

    const googleLogin = useGoogleLogin({
        onSuccess: async (response: any) => {
            try {
                setIsLoading(true)
                await socialAuthService.signInWithGoogleWeb(response.access_token)
                router.push('/(tabs)')
            } catch (error) {
                console.error('Google sign in error:', error)
            } finally {
                setIsLoading(false)
            }
        },
        onError: (error: any) => {
            console.error('Google login failed:', error)
        }
    })

    const handleEmailSignIn = () => {
        router.push('/(auth)/email')
    }

    const handleContinueAsGuest = async () => {
        try {
            setIsLoading(true)
            await signOut()
            router.push('/(tabs)')
        } catch (error) {
            console.error('Guest sign in error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <GoogleOAuthProvider clientId={process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID}>

            <View className="flex-1 justify-center items-center p-4 bg-background dark:bg-background-dark">
                <View className="w-full max-w-md space-y-4">
                    <Button
                        variant="outline"
                        onPress={() => googleLogin()}
                        loading={isLoading}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {t('auth.continueWithGoogle')}
                    </Button>

                    <Button
                        variant="default"
                        onPress={handleEmailSignIn}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {t('auth.signInWithEmail')}
                    </Button>

                    <Button
                        variant="ghost"
                        onPress={handleContinueAsGuest}
                        loading={isLoading}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {t('auth.continueAsGuest')}
                    </Button>
                </View>
            </View>
        </GoogleOAuthProvider>
    )
}