import { RadioGroup } from '@shared/ui/radio'
import { Text, Title } from '@shared/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'

export const Ask2Screen = () => {
    const { setNextScreen, updateOnboardingData } = useOnboarding()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    const [selectedGender, setSelectedGender] = useState<string>('')

    // Добавим отдельную функцию для обработки изменений
    const handleGenderSelect = (value: string) => {
        setSelectedGender(value)
        updateOnboardingData({ gender: value })
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
                    {t('screens.onboarding.ask2.title')}
                </Title>

                <Text
                    size="lg"
                    variant="secondary"
                    className="text-center mb-8"
                >
                    {t('screens.onboarding.ask2.description')}
                </Text>
            </Animated.View>



            {/* Анимированный контейнер для контента */}
            <Animated.View
                className="flex justify-center px-6"
                entering={FadeIn.delay(400).duration(800)}
            >
                <RadioGroup
                    options={[
                        { label: t('screens.onboarding.ask2.option1'), value: 'M' },
                        { label: t('screens.onboarding.ask2.option2'), value: 'F' },
                        { label: t('screens.onboarding.ask2.option3'), value: 'N' },
                    ]}
                    value={selectedGender}
                    onChange={handleGenderSelect}
                    containerClassName="bg-background dark:bg-background-dark"
                    radioClassName="px-6 py-6"
                    textSize="lg"
                />
            </Animated.View>
        </View>
    )
}