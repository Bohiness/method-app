// src/features/onboarding/screens/OnboardingContainer.tsx
import { BackgroundWithNoise } from '@shared/ui/bg/BackgroundWithNoise'
import { Button } from '@shared/ui/button'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { screens } from '../config/screens'
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext'


const OnboardingContent = () => {
    const {
        currentScreen,
        setNextScreen,
        setPreviousScreen,
        currentIndex,
    } = useOnboarding()

    const screenConfig = screens.find(s => s.key === currentScreen)
    if (!screenConfig) return null
    const { t } = useTranslation()

    const ScreenComponent = screenConfig.component
    const insets = useSafeAreaInsets()

    return (
        <BackgroundWithNoise className="flex-1 bg-surface-paper dark:bg-surface-paper-dark" >
            {screenConfig.canBack && (
                <View className="absolute left-1 z-10" style={{ paddingTop: insets.top }}>
                    <Button
                        variant="ghost"
                        onPress={setPreviousScreen}
                        leftIcon="ChevronLeft"
                        className='px-4'
                    />
                </View>
            )}
            {/* Кнопка пропуска */}
            {screenConfig.canSkip && (
                <View className="absolute right-1 z-10" style={{ paddingTop: insets.top }}>
                    <Button
                        variant="ghost"
                        onPress={setNextScreen}
                    >
                        {t('common.skip')}
                    </Button>
                </View>
            )}

            {/* Контент текущего экрана */}
            <Animated.View
                className="flex-1"
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                key={currentScreen}
            >
                <ScreenComponent />
            </Animated.View>

            {/* Индикаторы */}
            {currentIndex < screens.length - 1 && (
                <View className="flex-row justify-center" style={{ paddingBottom: insets.bottom }}>
                    {screens.slice(0, -1).map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 w-2 rounded-full mx-1 ${index === currentIndex
                                ? 'bg-secondary-light dark:bg-secondary-light-dark w-4'
                                : 'bg-secondary-light/30 dark:bg-secondary-light-dark/30'
                                }`}
                        />
                    ))}
                </View>
            )}
        </BackgroundWithNoise>
    )
}

export const OnboardingContainer = () => {
    return (
        <OnboardingProvider screenKeys={screens.map(s => s.key)}>
            <OnboardingContent />
        </OnboardingProvider>
    )
}