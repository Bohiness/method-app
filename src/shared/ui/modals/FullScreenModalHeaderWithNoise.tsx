// src/shared/ui/modals/ModalHeader.tsx
import { View } from '@shared/ui/view'
import { ReactNode } from 'react'
import Animated, { Layout } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackgroundWithNoise } from '../bg/BackgroundWithNoise'
import { Button } from '../button'

interface ModalHeaderProps {
    centerContent?: ReactNode
    closeButton?: boolean
    onClose?: () => void
    variant?: 'primary' | 'secondary' | 'accent' | 'surface'
}

export function FullScreenModalHeaderWithNoise({ variant = 'surface', centerContent, onClose, closeButton = true }: ModalHeaderProps) {
    const insets = useSafeAreaInsets()

    return (
        <BackgroundWithNoise
            variant={variant}
            className=" items-center justify-between relative"
        >
            <View
                className='flex-row items-center justify-between relative'
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
                <View className="w-10 items-end pr-2">
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
        </BackgroundWithNoise>
    )
}