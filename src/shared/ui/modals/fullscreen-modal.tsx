// src/shared/ui/modal/FullScreenModal.tsx
import { HapticTab } from '@shared/lib/utils/HapticTab'
import React from 'react'
import { Modal, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
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

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                className="flex-1 bg-background dark:bg-background-dark"
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
                <View className="flex-1">
                    {children}
                </View>
            </Animated.View>
        </Modal>
    )
}