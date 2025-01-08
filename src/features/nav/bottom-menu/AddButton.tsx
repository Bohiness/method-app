// src/features/nav/bottom-menu/AddButton.tsx
import { useAddMenu } from '@shared/context/add-menu-context'
import { useTheme } from '@shared/context/theme-provider'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Plus } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export const AddButton = () => {
    const { colors } = useTheme()
    const { isVisible, show, hide } = useAddMenu()
    const rotateAnim = useRef(new Animated.Value(0)).current

    // Обновляем анимацию при изменении состояния
    useEffect(() => {
        Animated.spring(rotateAnim, {
            toValue: isVisible ? 1 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7
        }).start()
    }, [isVisible])

    const handlePress = () => {
        if (isVisible) {
            hide()
        } else {
            show()
        }
    }

    // Настраиваем интерполяцию для плавного вращения
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
    })

    return (
        <View className="
            absolute 
            bottom-5 
            self-center 
            bg-background-dark
            dark:bg-background
            w-16 
            h-16 
            rounded-full 
            justify-center 
            items-center 
            shadow-lg
            z-50
        ">
            <HapticTab
                onPress={handlePress}
                hapticStyle="medium"
                className="
                    w-full 
                    h-full 
                    justify-center 
                    items-center
                "
            >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Plus
                        size={30}
                        color={colors.background}
                    />
                </Animated.View>
            </HapticTab>
        </View>
    )
}