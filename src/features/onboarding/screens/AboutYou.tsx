import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated'
import { useOnboarding } from '../context/OnboardingContext'

export const AboutYouScreen = () => {
    const { setNextScreen, loading } = useOnboarding()
    const { t } = useTranslation()

    return (
        <View className="flex-1 bg-white dark:bg-black">
            {/* Анимированный контейнер для изображения */}
            <Animated.View
                className="absolute top-28 left-0 right-0 w-full h-1/2"
                entering={SlideInUp.duration(800)}
            >
                <Image
                    source={require('@assets/images/screens/onboarding/onboarding-2.png')}
                    contentFit="contain"
                    style={{ width: 400, height: 390 }}
                />
            </Animated.View>

            {/* Анимированный контейнер для контента */}
            <Animated.View
                className="flex-1 justify-end px-6 pb-10"
                entering={FadeIn.delay(400).duration(800)}
            >
                <Title
                    size='3xl'
                    weight='bold'
                    className="text-center mb-4"
                >
                    {t('screens.onboarding.aboutyou.title')}
                </Title>

                <Text
                    size="lg"
                    variant="secondary"
                    className="text-center mb-8"
                >
                    {t('screens.onboarding.aboutyou.description')}
                </Text>

                <Button
                    onPress={setNextScreen}
                    className="w-fit self-center px-20"
                    size='lg'
                    disabled={loading}
                >
                    {t('screens.onboarding.aboutyou.button')}
                </Button>
            </Animated.View>
        </View>
    )
}