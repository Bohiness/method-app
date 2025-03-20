import { Button } from '@shared/ui/button'
import { CheckboxGroup } from '@shared/ui/checkbox-group'
import { Text, Title } from '@shared/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'

export const Ask4Screen = () => {
    const { setNextScreen, updateOnboardingData } = useOnboarding()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    const [selectedFocuses, setSelectedFocuses] = useState<string[]>([])

    // Обновленная функция для обработки множественного выбора
    const handleFocusSelect = (values: string[]) => {
        setSelectedFocuses(values)
        updateOnboardingData({ focuses: values })
    }

    // Функция для перехода на следующий экран
    const handleContinue = () => {
        if (selectedFocuses.length > 0) {
            setNextScreen()
        }
    }

    return (
        <View
            className="flex-1 flex justify-between top-20"
            style={{
                paddingTop: insets.top,
                paddingBottom: insets.bottom
            }}
        >
            {/* Верхняя часть с заголовком и описанием */}
            <View className="flex-1">
                <Animated.View
                    className="flex justify-center px-6"
                    entering={SlideInRight.duration(800)}
                >
                    <Title
                        size='3xl'
                        weight='bold'
                        className="text-center mb-4"
                    >
                        {t('screens.onboarding.ask3.title')}
                    </Title>

                    <Text
                        size="lg"
                        variant="secondary"
                        className="text-center mb-8"
                    >
                        {t('screens.onboarding.ask3.description')}
                    </Text>
                </Animated.View>

                {/* Анимированный контейнер для чекбоксов */}
                <Animated.View
                    className="flex justify-center px-6"
                    entering={FadeIn.delay(400).duration(800)}
                >
                    <CheckboxGroup
                        options={[
                            { label: t('screens.onboarding.ask3.option1'), value: 'work' },
                            { label: t('screens.onboarding.ask3.option2'), value: 'personal' },
                            { label: t('screens.onboarding.ask3.option3'), value: 'relationships' },
                            { label: t('screens.onboarding.ask3.option4'), value: 'health' },
                            { label: t('screens.onboarding.ask3.option5'), value: 'finance' },
                            { label: t('screens.onboarding.ask3.option6'), value: 'other' },
                        ]}
                        values={selectedFocuses}
                        onChange={handleFocusSelect}
                        containerClassName="bg-background dark:bg-background-dark"
                        checkboxClassName="px-6 py-6"
                        textSize="lg"
                    />
                </Animated.View>
            </View>

            {/* Кнопка продолжить внизу экрана */}
            <Animated.View
                className="px-6 pb-20"
                entering={FadeIn.delay(400).duration(800)}
            >
                <Button
                    onPress={handleContinue}
                    className="w-fit self-center px-20"
                    size='lg'
                    disabled={selectedFocuses.length === 0}
                >
                    {t('common.continue')}
                </Button>
            </Animated.View>
        </View>
    )
}