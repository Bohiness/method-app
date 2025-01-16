import { useUpdateProfile } from '@shared/context/user-provider'
import { useScreenNavigation } from '@shared/hooks/modal/useScreenNavigation'
import React, { useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import Animated, {
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight
} from 'react-native-reanimated'
import { SCREEN_CONFIG, ScreenType } from './screens/configs/screens.config'

export const SettingModal = () => {
    const navigation = useScreenNavigation<ScreenType>('main')
    const { mutateAsync } = useUpdateProfile()

    useEffect(() => {
        console.log('current screen', navigation.currentScreen)
        console.log('previous screen', navigation.previousScreen)
        console.log('is going back', navigation.isGoingBack)
    }, [navigation.currentScreen, navigation.previousScreen, navigation.isGoingBack])

    const AnimatedView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
            <Animated.View
                entering={navigation.isGoingBack ? SlideInLeft : SlideInRight}
                exiting={navigation.isGoingBack ? SlideOutLeft : SlideOutRight}
                className="flex-1"
            >
                {children}
            </Animated.View>
        )
    }

    const renderScreen = () => {
        const isInitialMainRender = navigation.currentScreen === 'main' && !navigation.previousScreen
        const screenConfig = SCREEN_CONFIG[navigation.currentScreen]
        const Component = screenConfig.component

        // Базовые пропсы для навигации
        const baseProps = {
            onBack: navigation.goBack,
            onNavigate: navigation.navigate,
        }

        // Дополнительные пропсы из конфигурации
        const configProps = screenConfig.props || {}

        // Пропсы для сохранения данных (если есть validator)
        const saveProps = configProps.validator
            ? {
                onSave: async (value: string) => {
                    if (configProps.field) {
                        await mutateAsync({ [configProps.field]: value })
                    }
                }
            }
            : {}

        // Объединяем все пропсы
        const componentProps = {
            ...baseProps,
            ...configProps,
            ...saveProps
        }

        if (isInitialMainRender) {
            return (
                <Component {...componentProps} />
            )
        }

        return (
            <AnimatedView>
                <Component {...componentProps} />
            </AnimatedView>
        )
    }

    return (
        <View className="flex-1">
            <ScrollView className="flex-1 relative">
                {renderScreen()}
            </ScrollView>
        </View>
    )
}