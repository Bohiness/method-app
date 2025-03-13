// src/widgets/diary/mood/steps/SuccessStep.tsx
import { EveningReflectionStackParamList } from '@app/(modals)/(diary)/evening-reflection/StepNavigator'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { StreakWidget } from '@widgets/gamification/streak/StreakWidget'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SuccessStepEveningReflectionProps = NativeStackScreenProps<EveningReflectionStackParamList, 'SuccessStepEveningReflection'>

export function SuccessStepEveningReflection({ route, navigation }: SuccessStepEveningReflectionProps) {
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()

    // Анимация для иконки
    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{
            scale: withSpring(1.2, {
                damping: 10,
                stiffness: 100,
            })
        }],
    }))

    const handleDone = async () => {
        router.dismissTo('/(tabs)')
    }

    return (
        <View className="flex-1 px-4" variant='default'>
            <View className="flex-1 items-center justify-center">
                <Animated.View
                    entering={FadeInDown.delay(300)}
                    style={animatedIconStyle}
                    className="p-6 rounded-full"
                >
                    <Icon name="Check" size={60} />
                </Animated.View>

                <Animated.View entering={FadeIn.delay(600)}>
                    <Title className="text-center mb-4">
                        {t('diary.eveningreflection.success.title')}
                    </Title>
                    <Text
                        variant="secondary"
                        className="text-center mb-8"
                    >
                        {t('diary.eveningreflection.success.description')}
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeIn.delay(900)}
                    className="w-full mb-8"
                >
                    <StreakWidget />
                </Animated.View>
            </View>

            <Button
                variant="default"
                fullWidth
                onPress={handleDone}
                style={{ marginBottom: insets.bottom }}
            >
                {t('common.done')}
            </Button>
        </View>
    )
}