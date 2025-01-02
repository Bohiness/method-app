import { useScreenNavigation } from '@shared/hooks/modal/useScreenNavigation'
import React from 'react'
import { ScrollView, View } from 'react-native'
import Animated, {
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight
} from 'react-native-reanimated'
import { DefaultScreen } from './screens/DefaultScreen'
import { FullProfileScreen } from './screens/FullProfileScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { LanguageScreen } from './screens/inner/LanguageScreen'
import { NotificationScreen } from './screens/inner/NotificationScreen'
import { ThemeScreen } from './screens/inner/ThemeScreen'

export type ScreenType = 'main' | 'settings' | 'profile' | 'notifications' | 'theme' | 'language'

export const SettingModal = () => {
    const navigation = useScreenNavigation<ScreenType>('main')

    const AnimatedView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
            <Animated.View
                entering={navigation.isGoingBack ? SlideInLeft : SlideInRight}
                exiting={navigation.isGoingBack ? SlideOutRight : SlideOutLeft}
                className="flex-1"
            >
                {children}
            </Animated.View>
        )
    }


    const renderScreen = () => {
        switch (navigation.currentScreen) {
            case 'main':
                return (
                    <AnimatedView>
                        <DefaultScreen onNavigate={navigation.navigate} />
                    </AnimatedView>
                )

            case 'settings':
                return (
                    <AnimatedView>
                        <SettingsScreen onBack={navigation.goBack} onNavigate={navigation.navigate} />
                    </AnimatedView>
                )

            case 'notifications':
                return (
                    <AnimatedView>
                        <NotificationScreen onBack={navigation.goBack} onNavigate={navigation.navigate} />
                    </AnimatedView>
                )

            case 'theme':
                return (
                    <AnimatedView>
                        <ThemeScreen onBack={navigation.goBack} onNavigate={navigation.navigate} />
                    </AnimatedView>
                )


            case 'language':
                return (
                    <AnimatedView>
                        <LanguageScreen onBack={navigation.goBack} onNavigate={navigation.navigate} />
                    </AnimatedView>
                )

            case 'profile':
                return (
                    <AnimatedView>
                        <FullProfileScreen onBack={navigation.goBack} onNavigate={navigation.navigate} />
                    </AnimatedView>
                )
        }
    }

    return (
        <View className="flex-1">
            <ScrollView className="flex-1">
                <AnimatedView>
                    {renderScreen()}
                </AnimatedView>
            </ScrollView>
        </View>
    )
}