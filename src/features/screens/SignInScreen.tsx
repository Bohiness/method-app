import { useUser } from '@shared/context/user-provider'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { Container, View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function SignInScreen() {
    const insets = useSafeAreaInsets()
    const { t } = useTranslation()
    const { signOut } = useUser()

    const handleGoogleSignIn = () => {
        // Логика входа через Google
    }

    const handleAppleSignIn = () => {
        // Логика входа через Apple
    }

    const handleEmailSignIn = () => {
        router.push('/signin/email')
    }

    const handleContinueAsGuest = async () => {
        await signOut() // Это создаст нового анонимного пользователя
        router.push('/(tabs)')
    }

    return (
        <Container
            style={{ paddingTop: insets.top }}
            className="flex-1 px-4"
        >
            {/* Логотип и заголовок */}
            <View className="items-center justify-center flex-1">
                <Image
                    source={require('@assets/images/logo/logo-black.svg')}
                    className="w-32 h-32 rounded-2xl mb-8"
                />
                <Text
                    size="2xl"
                    weight="bold"
                    className="text-center mb-2"
                >
                    {t('auth.welcome')}
                </Text>
                <Text
                    variant="secondary"
                    className="text-center mb-8"
                >
                    {t('auth.signInPrompt')}
                </Text>
            </View>

            {/* Кнопки авторизации */}
            <View className="space-y-4 mb-8">
                {/* Google */}
                <Button
                    variant="outline"
                    leftIcon="Google"
                    onPress={handleGoogleSignIn}
                    className="w-full"
                >
                    {t('auth.continueWithGoogle')}
                </Button>

                {/* Apple */}
                <Button
                    variant="outline"
                    leftIcon="Apple"
                    onPress={handleAppleSignIn}
                    className="w-full"
                >
                    {t('auth.continueWithApple')}
                </Button>

                {/* Email */}
                <Button
                    variant="tint"
                    leftIcon="Mail"
                    onPress={handleEmailSignIn}
                    className="w-full"
                >
                    {t('auth.signInWithEmail')}
                </Button>

                {/* Гостевой вход */}
                <Button
                    variant="ghost"
                    onPress={handleContinueAsGuest}
                    className="w-full"
                >
                    {t('auth.continueAsGuest')}
                </Button>
            </View>

            {/* Политика конфиденциальности и условия использования */}
            <Text
                variant="secondary"
                size="sm"
                className="text-center mb-4"
            >
                {t('auth.termsNotice')}
            </Text>
        </Container>
    )
}