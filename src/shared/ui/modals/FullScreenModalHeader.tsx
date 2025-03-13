// src/shared/ui/modals/ModalHeader.tsx
import { View } from '@shared/ui/view'
import { ReactNode } from 'react'
import Animated, { Layout } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '../button'

interface ModalHeaderProps {
    centerContent?: ReactNode
    closeButton?: boolean
    onClose?: () => void
    variant?: 'default' | 'paper' | 'canvas' | 'stone' | 'inverse' | 'transparent'
}

export function FullScreenModalHeader({ variant = 'default', centerContent, onClose, closeButton = true }: ModalHeaderProps) {
    const insets = useSafeAreaInsets()

    return (
        <View
            variant={variant}
            className="flex-row items-center justify-between px-4 relative"
            style={{ zIndex: 1000, paddingTop: insets.top + 8, paddingBottom: 8 }}
        >
            {/* Левая часть – пустое пространство для балансировки */}
            <View className="w-10" />

            {/* Центральная часть – универсальный блок (например, StepIndicator) */}
            <Animated.View
                className="flex-1 items-center"
                layout={Layout.springify()}
            >
                {centerContent && centerContent}
            </Animated.View>

            {/* Правая часть – кнопка закрытия */}
            <View className="w-10 items-end">
                {closeButton && (
                    <Button
                        onPress={onClose}
                        leftIcon="X"
                        size="sm"
                        variant="ghost"
                    />
                )}
            </View>
        </View>
    )
}