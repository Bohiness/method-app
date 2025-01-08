import { EditProfileField } from '@features/EditProfileField/EditProfileField'
import { useUpdateProfile } from '@shared/context/user-provider'
import { useScreenNavigation } from '@shared/hooks/modal/useScreenNavigation'
import { t } from 'i18next'
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

export type ScreenType =
    | 'main'
    | 'settings'
    | 'profile'
    | 'notifications'
    | 'theme'
    | 'language'
    | 'email'
    | 'phone'
    | 'timezone'


export const SettingModal = () => {
    const navigation = useScreenNavigation<ScreenType>('main')
    const { mutateAsync } = useUpdateProfile()


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
            case 'email':
                return (
                    <AnimatedView>
                        <EditProfileField
                            onBack={navigation.goBack}
                            field="email"
                            title={t('profile.editEmail')}
                            placeholder="email@example.com"
                            validator={(value) => {
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                                if (!emailRegex.test(value)) return t('validation.invalidEmail')
                            }}
                            onSave={async (value) => {
                                await mutateAsync({ email: value })
                            }}
                        />
                    </AnimatedView>
                )

            case 'phone':
                return (
                    <AnimatedView>
                        <EditProfileField
                            onBack={navigation.goBack}
                            field="phone"
                            title={t('profile.editPhone')}
                            placeholder="+1234567890"
                            validator={(value) => {
                                if (!/^\+\d{10,}$/.test(value)) return t('validation.invalidPhone')
                            }}
                            onSave={async (value) => {
                                await mutateAsync({ phone: value })
                            }}
                        />
                    </AnimatedView>
                )
            default:
                return null
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