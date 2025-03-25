// src/widgets/diary/mood/steps/SuccessStep.tsx
import { EveningReflectionStackParamList } from '@app/(modals)/(diary)/evening-reflection/StepNavigator'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AnimatedCheck } from '@shared/ui/animated-icon/check'
import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { StreakWidget } from '@widgets/gamification/streak/StreakWidget'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Animated, {
    FadeIn
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SuccessStepEveningReflectionProps = NativeStackScreenProps<EveningReflectionStackParamList, 'SuccessStepEveningReflection'>

export function SuccessStepEveningReflection({ route, navigation }: SuccessStepEveningReflectionProps) {
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()

    const handleDone = async () => {
        router.dismissTo('/(tabs)')
    }

    return (
        <View className="flex-1 px-4" variant='default'>
            <View className="flex-1 items-center justify-center">
                <AnimatedCheck
                    size={100}
                />

                <Animated.View entering={FadeIn.delay(600)} className='pt-10'>
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
                className="w-fit self-center px-20"
                size='lg'
                onPress={handleDone}
                style={{ marginBottom: insets.bottom }}
            >
                {t('common.done')}
            </Button>
        </View>
    )
}