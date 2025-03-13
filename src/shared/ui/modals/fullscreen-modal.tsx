// src/shared/ui/modal/FullScreenModal.tsx
import { HapticTab } from '@shared/lib/utils/HapticTab'
import React, { useCallback, useEffect } from 'react'
import { BackHandler, Modal, View } from 'react-native'
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '../icon'

interface FullScreenModalProps {
    isVisible: boolean
    onClose: () => void
    children: React.ReactNode
    showCloseButton?: boolean
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
    isVisible,
    onClose,
    children,
    showCloseButton = true
}) => {
    const insets = useSafeAreaInsets()
    const opacity = useSharedValue(0)

    // Обработка аппаратной кнопки "Назад" на Android
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isVisible) {
                onClose()
                return true
            }
            return false
        })

        return () => backHandler.remove()
    }, [isVisible, onClose])

    // Анимация появления/исчезновения
    useEffect(() => {
        opacity.value = withTiming(isVisible ? 1 : 0, {
            duration: 300
        })
    }, [isVisible])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }))

    // Обработчик закрытия с haptic feedback
    const handleClose = useCallback(() => {
        requestAnimationFrame(onClose)
    }, [onClose])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                className="flex-1 bg-background dark:bg-background-dark"
                style={[animatedStyle]}
            >
                {showCloseButton && (
                    <View
                        className="absolute right-0 z-50"
                        style={{
                            top: insets.top + 8,
                            right: insets.right + 16,
                        }}
                    >
                        <HapticTab
                            onPress={onClose}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <Icon
                                name="X"
                                size={24}
                                variant='default'
                            />
                        </HapticTab>
                    </View>
                )}

                {/* Контент модального окна */}
                <Animated.View
                    className="flex-1"
                >
                    {children}
                </Animated.View>
            </Animated.View>
        </Modal>
    )
}