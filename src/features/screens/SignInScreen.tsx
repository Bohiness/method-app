import { useTheme } from '@shared/context/theme-provider'
import { useUser } from '@shared/context/user-provider'
import { useAppleAuth } from '@shared/hooks/auth/useAppleAuth'
import { useGoogleAuth } from '@shared/hooks/auth/useGoogleAuth'
import { Button } from '@shared/ui/button'
import { Logo } from '@shared/ui/system/logo'
import { Text } from '@shared/ui/text'
import { Container, View } from '@shared/ui/view'
import * as AppleAuthentication from 'expo-apple-authentication'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function SignInScreen() {
    const insets = useSafeAreaInsets()
    const { t } = useTranslation()
    const { signOut } = useUser()
    const { isDark } = useTheme()
    const [isLoading, setIsLoading] = useState(false)
    const [showAppleSignIn, setShowAppleSignIn] = useState(false)
    const { signIn: googleSignIn } = useGoogleAuth()
    const { isAvailable: isAppleAuthAvailable, signIn: appleSignIn } = useAppleAuth()

    // Проверяем доступность Apple Sign In
    useEffect(() => {
        if (Platform.OS === 'ios') {
            AppleAuthentication.isAvailableAsync().then(setShowAppleSignIn)
        }
    }, [])

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true)
            await googleSignIn()
            router.dismissAll()
            router.push('/(tabs)')
        } catch (error) {
            Alert.alert(
                t('common.error'),
                t('auth.errors.googleSignIn')
            )
            console.error('Google sign in error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAppleSignIn = async () => {
        try {
            setIsLoading(true)
            await appleSignIn()
            router.dismissAll()
            router.push('/(tabs)')
        } catch (error) {
            if (error instanceof Error && error.message !== 'Apple sign in was cancelled') {
                Alert.alert(
                    t('common.error'),
                    t('auth.errors.appleSignIn')
                )
            }
            console.error('Apple sign in error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailSignIn = () => {
        router.push('/(auth)/email')
    }

    const handleContinueAsGuest = async () => {
        try {
            setIsLoading(true)
            router.dismissAll()
            router.push('/(tabs)')
        } catch (error) {
            Alert.alert(
                t('common.error'),
                t('auth.errors.guestSignIn')
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container
            style={{ paddingTop: insets.top }}
            className="flex-1 px-4"
        >
            {/* Логотип и заголовок */}
            <View className="items-center justify-center flex-1">
                <Logo size={{ height: 70, width: 300 }} />
                <Text variant="secondary" >
                    {t('screens.splashscreen.yourgoals')}{' '}
                    {t('screens.splashscreen.yourenergy')}{' '}
                    {t('screens.splashscreen.yourjourney')}
                </Text>
            </View>

            {/* Кнопки авторизации */}
            <View className="gap-y-4 mb-8">
                {/* Google */}
                {/* <Button
                    variant="outline"
                    onPress={handleGoogleSignIn}
                    loading={isLoading}
                    disabled={isLoading}
                    className="w-full"
                >
                    <View className="flex-row items-center gap-x-2">
                        <Image
                            source={require('@assets/images/icons/google-icon.svg')}
                            style={{ height: 20, width: 20 }}
                            contentFit="contain"
                        />
                        <Text weight="medium">
                            {t('auth.continueWithGoogle')}
                        </Text>
                    </View>
                </Button> */}

                {/* Apple - показываем только на iOS если доступно */}
                {/* {isAppleAuthAvailable && (
                    <Button
                        variant="outline"
                        onPress={handleAppleSignIn}
                        loading={isLoading}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <View className="flex-row items-center gap-x-2">
                            <Image
                                source={isDark
                                    ? require('@assets/images/icons/apple-logo-gray.svg')
                                    : require('@assets/images/icons/apple-logo-black.svg')}
                                style={{ height: 20, width: 20 }}
                                contentFit="contain"
                            />
                            <Text weight="medium">
                                {t('auth.continueWithApple')}
                            </Text>
                        </View>
                    </Button>
                )} */}

                {/* Email */}
                <Button
                    variant="default"
                    onPress={handleEmailSignIn}
                    disabled={isLoading}
                    className="w-full"
                >
                    {t('auth.signInWithEmail')}
                </Button>

                {/* Гостевой вход */}
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

            {/* Политика конфиденциальности и условия использования */}
            <View className="flex-row items-center justify-center gap-x-4">
                <Text
                    variant="secondary"
                    size="sm"
                    className="text-center mb-4"
                >
                    {t('auth.termsNotice')}
                </Text>
                <Text
                    variant="secondary"
                    size="sm"
                    className="text-center mb-4"
                >
                    {t('auth.privacyPolicy')}
                </Text>
            </View>
        </Container>
    )
}