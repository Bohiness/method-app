// src/features/auth/LoginForm/LoginForm.tsx
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Alert, AlertDescription } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Switch } from '@shared/ui/switch'
import { Text } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'
import { useLoginForm } from './useLoginForm'

interface LoginFormProps {
    showTitle?: boolean
    nextPage?: string
    showExpertLogin?: boolean
    isExpertPage?: boolean
}

export const LoginForm = ({
    showTitle = true,
    nextPage = '',
    showExpertLogin = true,
    isExpertPage = false
}: LoginFormProps) => {
    const { email: initialEmail, message } = useLocalSearchParams<{ email: string; message: string }>()

    const { t } = useTranslation()

    const router = useRouter()
    const [showAlert, setShowAlert] = useState(false)

    const {
        email,
        handleEmailChange,
        password,
        setPassword,
        isPasswordValid,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        name,
        isRegister,
        isExpert,
        loading,
        errors,
        showPassword,
        handleClickShowPassword,
        handleSubmit,
        loginLikeExpert,
        setLoginLikeExpert,
        shouldShowPasswordField,
        shouldShowExpertFields
    } = useLoginForm(nextPage, isExpertPage)

    useEffect(() => {
        if (initialEmail) {
            handleEmailChange(initialEmail)
        }
    }, [initialEmail])

    useEffect(() => {
        if (errors.send) {
            setShowAlert(true)
        }
    }, [errors.send])

    const fadeAnim = useAnimatedStyle(() => ({
        opacity: withSpring(shouldShowPasswordField ? 1 : 0),
        height: withSpring(shouldShowPasswordField ? 'auto' : 0)
    }))

    return (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View
                    className="w-full flex-1 justify-center -mt-40"
                    entering={FadeIn}
                    exiting={FadeOut}
                >
                    {showTitle && (
                        <Text
                            size="3xl"
                            weight="medium"
                            className="mb-2"
                        >
                            {isRegister
                                ? t('auth.loginForm.createAccount')
                                : `${t('auth.loginForm.welcomeBack')}${name ? `, ${name}` : ''}`
                            }
                        </Text>
                    )}

                    {message && (
                        <Alert variant="success" className="mb-2">
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    <Text
                        variant="secondary"
                        className="mb-2"
                    >
                        {isRegister
                            ? t('auth.loginForm.enterNewPasswordToComplete')
                            : shouldShowPasswordField
                                ? t('auth.loginForm.enterPasswordToLogin')
                                : t('auth.loginForm.enterEmailToLoginOrCreate')
                        }
                    </Text>

                    {showAlert && errors.send && (
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                        >
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>
                                    {errors.send}
                                </AlertDescription>
                            </Alert>
                        </Animated.View>
                    )}

                    <View className="w-full gap-y-4">
                        <View className={isRegister ? "gap-y-6" : "gap-y-2"}>
                            <View className="gap-y-2">
                                <TextInput
                                    value={email}
                                    onChangeText={handleEmailChange}
                                    placeholder={t('auth.loginForm.email')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    error={errors.email}
                                />
                                {errors.email && (
                                    <Text variant="error" size="sm">
                                        {errors.email}
                                    </Text>
                                )}
                            </View>

                            <Animated.View style={fadeAnim}>
                                <View className="gap-y-6">
                                    <View className="gap-y-2">
                                        <View className="relative">
                                            <TextInput
                                                value={password}
                                                onChangeText={setPassword}
                                                placeholder={t('auth.loginForm.password')}
                                                secureTextEntry={!showPassword}
                                                autoComplete="password"
                                                error={errors.password}
                                                success={isRegister && isPasswordValid()}
                                                rightIcon={
                                                    <HapticTab onPress={handleClickShowPassword}>
                                                        {showPassword ? (
                                                            <Icon name="EyeOff" />
                                                        ) : (
                                                            <Icon name="Eye" />
                                                        )}
                                                    </HapticTab>
                                                }
                                            />
                                        </View>

                                        {!isRegister && shouldShowPasswordField && (
                                            <HapticTab
                                                onPress={() => router.push({
                                                    pathname: '/(auth)/forgot/forgot-password',
                                                    params: { email }
                                                })}
                                            >
                                                <Text
                                                    variant="secondary"
                                                    size="sm"
                                                    className="underline"
                                                >
                                                    {t('auth.loginForm.forgotPassword')}
                                                </Text>
                                            </HapticTab>
                                        )}
                                    </View>

                                    {isExpertPage && shouldShowExpertFields && (
                                        <View className="gap-y-2">
                                            <TextInput
                                                value={firstName}
                                                onChangeText={setFirstName}
                                                placeholder={t('auth.loginForm.firstName')}
                                                error={errors.firstName}
                                            />
                                            <TextInput
                                                value={lastName}
                                                onChangeText={setLastName}
                                                placeholder={t('auth.loginForm.lastName')}
                                                error={errors.lastName}
                                            />
                                            {errors.lastName && (
                                                <Text variant="error" size="sm">
                                                    {errors.lastName}
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    {showExpertLogin && isExpert && !isExpertPage && (
                                        <View className="flex-row items-center gap-x-2">
                                            <Switch
                                                value={loginLikeExpert}
                                                onValueChange={setLoginLikeExpert}
                                            />
                                            <Text>{t('auth.loginForm.loginLikeExpert')}</Text>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>
                        </View>

                        <Button
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={loading}
                            fullWidth
                        >
                            {isRegister
                                ? t('auth.loginForm.createAccount')
                                : t('auth.loginForm.login')
                            }
                        </Button>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}