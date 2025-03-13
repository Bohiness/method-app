
// src/features/auth/screens/VerifyCodeScreen.tsx
import { usePasswordReset } from '@shared/hooks/auth/usePasswordReset'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Alert, AlertDescription } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { Container, View } from '@shared/ui/view'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Mail } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated'

export const VerifyCodeScreen = () => {
    const { email } = useLocalSearchParams<{ email: string }>()

    const { t } = useTranslation()
    const router = useRouter()
    const [code, setCode] = useState('')

    const {
        resendAllowed,
        timeLeft,
        loading,
        errors,
        sendResetEmail,
        verifyCode,
        reset: changeEmail
    } = usePasswordReset({
        email,
        onSuccess: ({ token }) => {
            router.replace({
                pathname: '/(auth)/forgot/reset-password',
                params: { email, token }
            })
        }
    })

    const handleChangeEmail = () => {
        changeEmail()
        router.back()
    }

    const AnimatedMail = Animated.createAnimatedComponent(Mail)
    const mailAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: withRepeat(
                    withSequence(
                        withTiming(100, { duration: 1000 }),
                        withTiming(-100, { duration: 1000 }),
                        withTiming(0, { duration: 1000 })
                    ),
                    -1,
                    true
                )
            },
            {
                translateY: withRepeat(
                    withSequence(
                        withTiming(-50, { duration: 1500 }),
                        withTiming(0, { duration: 1500 })
                    ),
                    -1,
                    true
                )
            },
            {
                rotate: withRepeat(
                    withSequence(
                        withSpring('20deg'),
                        withSpring('-20deg'),
                        withSpring('0deg')
                    ),
                    -1,
                    true
                )
            }
        ]
    }))

    return (
        <Container className="flex-1 justify-center items-center p-4">
            <View className="w-full max-w-md items-center gap-y-6">
                <Animated.View style={mailAnimatedStyle}>
                    <Icon name="Mail" size={80} />
                </Animated.View>

                <View className="items-center gap-y-2">
                    <Text size="2xl" weight="medium">
                        {t('auth.checkEmailBlock.enterCode')}
                    </Text>
                    <Text className="text-center" variant="secondary">
                        {t('auth.checkEmailBlock.codeSentTo')}
                    </Text>
                    <Text weight="medium">{email}</Text>
                </View>

                <View className="w-full gap-y-6">
                    <TextInput
                        value={code}
                        onChangeText={setCode}
                        placeholder={t('auth.checkEmailBlock.enterCodePlaceholder')}
                        keyboardType="number-pad"
                        maxLength={6}
                        className="w-full p-4 text-center text-xl border rounded-lg"
                    />
                    {errors.server && (
                        <Alert variant="destructive">
                            <AlertDescription>{errors.server}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onPress={() => verifyCode(code)}
                        disabled={code.length !== 6 || loading}
                        loading={loading}
                        fullWidth
                    >
                        {t('auth.checkEmailBlock.verify')}
                    </Button>

                    <View className="gap-y-2">
                        <Text variant="secondary" size="sm" className="text-center">
                            {t('auth.checkEmailBlock.noCode')}
                        </Text>

                        <HapticTab
                            onPress={() => sendResetEmail(email)}
                            disabled={!resendAllowed || loading}
                        >
                            <Text variant="tint" size="sm" className="text-center underline">
                                {resendAllowed
                                    ? t('auth.checkEmailBlock.resendCode')
                                    : t('auth.checkEmailBlock.resendAvailable', { seconds: timeLeft })
                                }
                            </Text>
                        </HapticTab>

                        <HapticTab onPress={handleChangeEmail}>
                            <Text variant="tint" size="sm" className="text-center underline">
                                {t('auth.checkEmailBlock.tryAnotherEmail')}
                            </Text>
                        </HapticTab>
                    </View>
                </View>
            </View>
        </Container>
    )
}