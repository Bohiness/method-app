import { RadioGroup } from '@shared/ui/radio'
import { Text, Title } from '@shared/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'

export const Ask1Screen = () => {
    const { setNextScreen, updateOnboardingData } = useOnboarding()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    const [selectedAge, setSelectedAge] = useState<string>('')

    // Добавим отдельную функцию для обработки изменений
    const handleAgeSelect = (value: string) => {
        setSelectedAge(value)
        updateOnboardingData({ age: value })
        setTimeout(() => {
            setNextScreen()
        }, 300)
    }

    return (
        <View className="flex-1 bg-white dark:bg-black top-20" style={{ paddingTop: insets.top }}>
            {/* Анимированный контейнер для изображения */}
            <Animated.View
                className="flex justify-center px-6"
                entering={SlideInRight.duration(800)}
            >
                <Title
                    size='3xl'
                    weight='bold'
                    className="text-center mb-4"
                >
                    {t('screens.onboarding.ask1.title')}
                </Title>

                <Text
                    size="lg"
                    variant="secondary"
                    className="text-center mb-8"
                >
                    {t('screens.onboarding.ask1.description')}
                </Text>
            </Animated.View>



            {/* Анимированный контейнер для контента */}
            <Animated.View
                className="flex justify-center px-6"
                entering={FadeIn.delay(400).duration(800)}
            >
                <RadioGroup
                    options={[
                        { label: t('screens.onboarding.ask1.option1'), value: '13-17' },
                        { label: t('screens.onboarding.ask1.option2'), value: '18-24' },
                        { label: t('screens.onboarding.ask1.option3'), value: '25-34' },
                        { label: t('screens.onboarding.ask1.option4'), value: '35-44' },
                        { label: t('screens.onboarding.ask1.option5'), value: '45-54' },
                        { label: t('screens.onboarding.ask1.option6'), value: '55+' },
                    ]}
                    value={selectedAge}
                    onChange={handleAgeSelect}
                    containerClassName="bg-background dark:bg-background-dark"
                    radioClassName="px-6 py-6"
                    textSize="lg"
                />
            </Animated.View>
        </View>
    )
}