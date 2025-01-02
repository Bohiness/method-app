// src/shared/lib/utils/HapticTab.tsx
import * as Haptics from 'expo-haptics'
import { ComponentProps, useCallback } from 'react'
import { GestureResponderEvent, Pressable } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

type HapticTabProps = {
    children?: React.ReactNode
    onPress?: (event: GestureResponderEvent) => void
    hapticStyle?: HapticStyle
    /**
     * Включить/выключить анимацию нажатия
     * @default true
     */
    animate?: boolean
    /**
     * Включить/выключить тактильный отклик
     * @default true
     */
    haptics?: boolean
    /**
     * Пользовательские стили
     */
    style?: ComponentProps<typeof Animated.View>['style']
} & Omit<ComponentProps<typeof Pressable>, 'children' | 'onPress' | 'style'>

const getHapticFeedback = (style: HapticStyle) => {
    switch (style) {
        case 'light':
            return () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        case 'medium':
            return () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        case 'heavy':
            return () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        case 'success':
            return () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        case 'warning':
            return () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        case 'error':
            return () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        default:
            return () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
}

export const HapticTab = ({
    children,
    onPress,
    hapticStyle = 'light',
    animate = true,
    haptics = true,
    style,
    ...props
}: HapticTabProps) => {
    // Значение для анимации
    const pressed = useSharedValue(1)

    // Анимированные стили
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{
            scale: withSpring(pressed.value, {
                mass: 0.5,
                damping: 8,
                stiffness: 150,
            })
        }],
    }))

    // Обработчики нажатия
    const handlePressIn = useCallback(() => {
        if (animate) {
            pressed.value = 0.95
        }
    }, [animate])

    const handlePressOut = useCallback(() => {
        if (animate) {
            pressed.value = 1
        }
    }, [animate])

    const handlePress = useCallback((event: GestureResponderEvent) => {
        if (haptics) {
            getHapticFeedback(hapticStyle)()
        }
        onPress?.(event)
    }, [haptics, hapticStyle, onPress])

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            {...props}
        >
            <Animated.View style={[animate ? animatedStyle : undefined, style]}>
                {children}
            </Animated.View>
        </Pressable>
    )
}

// Отдельные компоненты для разных типов тактильной обратной связи
export const SuccessHapticTab = (props: Omit<HapticTabProps, 'hapticStyle'>) => (
    <HapticTab hapticStyle="success" {...props} />
)

export const ErrorHapticTab = (props: Omit<HapticTabProps, 'hapticStyle'>) => (
    <HapticTab hapticStyle="error" {...props} />
)

export const WarningHapticTab = (props: Omit<HapticTabProps, 'hapticStyle'>) => (
    <HapticTab hapticStyle="warning" {...props} />
)