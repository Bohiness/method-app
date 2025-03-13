import { useColors } from '@shared/context/theme-provider'
import { Text } from '@shared/ui/text'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated'

// Компонент для отображения ответа с анимацией
export const AIResponse = ({ text }: { text: string }) => {
    const scale = useSharedValue(0.8)
    const opacity = useSharedValue(0)
    const colors = useColors()

    useEffect(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 100 })
        opacity.value = withTiming(1, { duration: 500 })
    }, [])

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }))

    return (
        <Animated.View style={style} className="px-6 py-4 max-w-[85%]">
            <View
                className="rounded-3xl p-6 backdrop-blur-lg"
                style={{
                    backgroundColor: `${colors.background}AA`,
                    borderWidth: 1,
                    borderColor: `${colors.border}66`,
                }}
            >
                <Text className="text-lg text-center">{text}</Text>
            </View>
        </Animated.View>
    )
}