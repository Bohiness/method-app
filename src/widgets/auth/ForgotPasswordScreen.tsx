// src/features/auth/screens/ForgotPasswordScreen.tsx
import { usePasswordReset } from '@shared/hooks/auth/usePasswordReset'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Alert, AlertDescription } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'

export const ForgotPasswordScreen = () => {
    const { t } = useTranslation()
    const { email: emailFromParams } = useLocalSearchParams<{ email: string }>()

    const {
        email,
        setEmail,
        loading,
        errors,
        sendResetEmail
    } = usePasswordReset({
        onSuccess: () => {
            router.push({
                pathname: '/(auth)/forgot/verify-code',
                params: { email }
            })
        }
    })

    useEffect(() => {
        if (emailFromParams) {
            setEmail(emailFromParams)
        }
    }, [emailFromParams])

    return (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="w-full flex-1 justify-center -mt-40">
                    <Text size="3xl" weight="medium" className="mb-4">
                        {t('auth.forgotPassword.forgotPassword')}
                    </Text>

                    <Text variant="secondary" size="sm" className="mb-2">
                        {t('auth.forgotPassword.willSendCode')}
                    </Text>

                    <View className="gap-y-4">
                        <View>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('auth.forgotPassword.email')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                error={errors.email}
                            />
                            {errors.email && (
                                <Text variant="error" size="sm" className="mt-1">
                                    {errors.email}
                                </Text>
                            )}
                        </View>

                        <Button
                            onPress={() => sendResetEmail(email)}
                            loading={loading}
                            disabled={loading}
                            fullWidth
                        >
                            {loading
                                ? t('auth.forgotPassword.sending')
                                : t('auth.forgotPassword.sendVerificationCode')
                            }
                        </Button>

                        <View className="flex-row justify-center items-center gap-x-1">
                            <Text variant="secondary">
                                {t('auth.forgotPassword.returnTo')}
                            </Text>
                            <HapticTab onPress={() => router.push('/(auth)/signin')}>
                                <Text variant="tint" className="underline">
                                    {t('auth.forgotPassword.login')}
                                </Text>
                            </HapticTab>
                        </View>

                        {errors.server && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.server}</AlertDescription>
                            </Alert>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}