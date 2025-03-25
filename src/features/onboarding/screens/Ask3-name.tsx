import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableWithoutFeedback, View } from 'react-native'
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'


export const Ask3Screen = () => {
    const { setNextScreen, updateOnboardingData, loading } = useOnboarding()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight, dismissKeyboard } = useKeyboard()
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
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View
                className="flex-1"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: isKeyboardVisible ? keyboardHeight : insets.bottom
                }}
            >
                <View className="flex-1 top-20">
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
                        <TextInput
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
                        className="px-6 mb-20"
                        entering={FadeIn.delay(400).duration(800)}
                    >
                        <Button
                            onPress={handleContinue}
                            className="w-fit self-center px-20"
                            size='lg'
                            disabled={!isValid || loading}
                        >
                            {t('common.continue')}
                        </Button>
                    </Animated.View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}