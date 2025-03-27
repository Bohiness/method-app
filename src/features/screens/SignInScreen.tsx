import { API_URLS } from '@shared/constants/URLS'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { Button } from '@shared/ui/button'
import { Logo } from '@shared/ui/system/logo'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function SignInScreen() {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)
    const { locale } = useLocale()
    const insets = useSafeAreaInsets()


    const handleEmailSignIn = () => {
        router.push('/(auth)/email')
    }

    const handleContinueAsGuest = async () => {
        try {
            setIsLoading(true)
            router.dismissAll()
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
        <View className="flex-1" >
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
                    onPress={() => { Linking.openURL(API_URLS.DOCS.getTerms(locale)) }}
                >
                    {t('auth.termsNotice')}
                </Text>
                <Text
                    variant="secondary"
                    size="sm"
                    className="text-center mb-4"
                    onPress={() => { Linking.openURL(API_URLS.DOCS.getPrivacy(locale)) }}
                >
                    {t('auth.privacyPolicy')}
                </Text>
            </View>
        </View>
    )
}