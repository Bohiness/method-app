import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Text, Title } from '@shared/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'


export const Ask4Screen = () => {
    const { setNextScreen, updateOnboardingData } = useOnboarding()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    const [firstName, setFirstName] = useState<string>('')
    const [isValid, setIsValid] = useState(false)

    const handleNameChange = (value: string) => {
        setFirstName(value)
        setIsValid(value.trim().length >= 2)
    }

    const handleContinue = () => {
        if (isValid) {
            updateOnboardingData({ first_name: firstName.trim() })
            setNextScreen()
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-white dark:bg-black top-20" style={{
                paddingTop: insets.top,
                paddingBottom: insets.bottom
            }}>
                {/* Заголовок и описание */}
                <Animated.View
                    className="flex justify-center px-6"
                    entering={SlideInRight.duration(800)}
                >
                    <Title
                        size='3xl'
                        weight='bold'
                        className="text-center mb-4"
                    >
                        {t('screens.onboarding.ask4.title')}
                    </Title>

                    <Text
                        size="lg"
                        variant="secondary"
                        className="text-center mb-8"
                    >
                        {t('screens.onboarding.ask4.description')}
                    </Text>
                </Animated.View>

                {/* Поле ввода */}
                <Animated.View
                    className="flex-1 px-6"
                    entering={FadeIn.delay(400).duration(800)}
                >
                    <Input
                        label={t('screens.onboarding.ask4.label')}
                        placeholder={t('screens.onboarding.ask4.placeholder')}
                        value={firstName}
                        onChangeText={handleNameChange}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleContinue}
                        className="mb-8"
                        inputClassName="bg-background dark:bg-background-dark text-text dark:text-text-dark"
                    />
                </Animated.View>

                {/* Кнопка внизу */}
                <Animated.View
                    className="px-6 mb-10"
                    entering={FadeIn.delay(400).duration(800)}
                >
                    <Button
                        onPress={handleContinue}
                        className="w-fit self-center px-20 mb-10"
                        size='lg'
                        disabled={!isValid}
                    >
                        {t('common.continue')}
                    </Button>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    )
}