import { useUpdateProfile } from '@shared/context/user-provider'
import { useScreenNavigation } from '@shared/hooks/modal/useScreenNavigation'
import { View } from '@shared/ui/view'
import React from 'react'
import { ScrollView } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
    runOnJS
} from 'react-native-reanimated'
import { SCREEN_CONFIG, ScreenType } from './screens/configs/screens.config'

interface SettingModalProps {
    startScreen?: ScreenType
}

export const SettingModal = ({ startScreen = 'main' }: SettingModalProps) => {
    const navigation = useScreenNavigation<ScreenType>(startScreen)
    const { mutateAsync } = useUpdateProfile()

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .onEnd((event) => {
            if (event.velocityX > 500 && navigation.currentScreen !== 'main') {
                runOnJS(navigation.goBack)()
            }
        })

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
        <View className="flex-1" >
            <GestureDetector gesture={swipeGesture}>
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 relative" contentContainerStyle={{ flexGrow: 1 }}>
                    {renderScreen()}
                </ScrollView>
            </GestureDetector>
        </View>
    )
}