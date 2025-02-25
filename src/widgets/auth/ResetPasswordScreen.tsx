// src/features/auth/screens/ResetPasswordScreen.tsx
import { usePasswordReset } from '@shared/hooks/auth/usePasswordReset'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Alert, AlertDescription } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'

export const ResetPasswordScreen = () => {
    const { email, token } = useLocalSearchParams<{ email: string; token: string }>()

    const { t } = useTranslation()
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)

    const {
        loading,
        errors,
        resetPassword
    } = usePasswordReset({
        email,
        token,
        onSuccess: () => {
            router.replace({
                pathname: '/(auth)/email',
                params: { email, message: t('auth.passwordReset.passwordResetSuccess') }
            })
        }
    })

    const handleClickShowPassword = (field: 'password' | 'password2') => {
        if (field === 'password') {
            setShowPassword(prev => !prev)
        } else {
            setShowPassword2(prev => !prev)
        }
    }

    const handleSubmit = () => {
        resetPassword(password, password2)
    }

    return (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="w-full flex-1 justify-center -mt-40">
                    <Text size="3xl" weight="medium" className="mb-6">
                        {t('auth.passwordReset.resetPassword')}
                    </Text>

                    <View className="gap-y-4">
                        <View>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder={t('auth.passwordReset.password')}
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
                                error={errors.password}
                                rightIcon={
                                    <HapticTab onPress={() => handleClickShowPassword('password')}>
                                        {showPassword ? (
                                            <EyeOff size={20} color="gray" />
                                        ) : (
                                            <Eye size={20} color="gray" />
                                        )}
                                    </HapticTab>
                                }
                            />
                            {errors.password && (
                                <Alert variant="destructive">
                                    <AlertDescription>{errors.password}</AlertDescription>
                                </Alert>
                            )}
                        </View>

                        <View>
                            <TextInput
                                value={password2}
                                onChangeText={setPassword2}
                                placeholder={t('auth.passwordReset.confirmPassword')}
                                secureTextEntry={!showPassword2}
                                autoComplete="new-password"
                                error={errors.password2}
                                rightIcon={
                                    <HapticTab onPress={() => handleClickShowPassword('password2')}>
                                        {showPassword2 ? (
                                            <EyeOff size={20} color="gray" />
                                        ) : (
                                            <Eye size={20} color="gray" />
                                        )}
                                    </HapticTab>
                                }
                            />
                            {errors.password2 && (
                                <Text variant="error" size="sm" className="mt-1">
                                    {errors.password2}
                                </Text>
                            )}
                        </View>

                        <Button
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={loading}
                            fullWidth
                        >
                            {loading
                                ? t('auth.passwordReset.resetting')
                                : t('auth.passwordReset.resetPassword')
                            }
                        </Button>

                        <View className="flex-row items-center justify-center gap-x-1">
                            <Text size="sm">{t('auth.passwordReset.returnTo')}</Text>
                            <HapticTab onPress={() => router.push('/(auth)/signin')}>
                                <Text size="sm" variant="tint" className="underline">
                                    {t('auth.passwordReset.login')}
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