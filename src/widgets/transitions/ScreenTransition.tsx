// src/shared/ui/transitions/ScreenTransition.tsx
import { BottomButton } from '@entities/modals/bottom-button'
import { View } from '@shared/ui/view'
import React, { ReactNode } from 'react'
import Animated, {
    Layout,
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight
} from 'react-native-reanimated'

export interface ScreenTransitionProps {
    children: ReactNode
    currentIndex: number
    totalScreens: number
    canBack?: boolean
    canSkip?: boolean
    enabledBackButton?: boolean
    enabledNextButton?: boolean
    setEnabledNextButton?: (enabled: boolean) => void
    setEnabledBackButton?: (enabled: boolean) => void
    showButtonBlock?: boolean
    onNext?: () => void
    onBack?: () => void
    hideIndicators?: boolean
    className?: string
    customTopLeftButton?: ReactNode
    customTopRightButton?: ReactNode
    animate?: boolean // новое свойство: включать/выключать анимацию переключения экранов
    transitionDirection?: 1 | -1 // новое свойство: направление перехода (1 – вперед, -1 – назад)
}

export const ScreenTransition = ({
    children,
    currentIndex,
    totalScreens,
    canBack = true,
    canSkip = true,
    setEnabledNextButton,
    setEnabledBackButton,
    enabledBackButton = true,
    enabledNextButton = true,
    showButtonBlock = true,
    onNext,
    onBack,
    hideIndicators,
    className = '',
    customTopLeftButton,
    customTopRightButton,
    animate = true,
    transitionDirection = 1,
}: ScreenTransitionProps) => {

    const enteringAnimation = React.useMemo(() => {
        if (!animate) return undefined
        // При движении вперед (direction = 1) входим справа
        // При движении назад (direction = -1) входим слева
        return transitionDirection > 0
            ? SlideInRight.duration(300)
            : SlideInLeft.duration(300)
    }, [animate, transitionDirection])

    const exitingAnimation = React.useMemo(() => {
        if (!animate) return undefined
        // При движении вперед (direction = 1) выходим влево
        // При движении назад (direction = -1) выходим вправо
        return transitionDirection > 0
            ? SlideOutLeft.duration(300)
            : SlideOutRight.duration(300)
    }, [animate, transitionDirection])

    return (
        <Animated.View
            className={`flex-1 ${className}`}
            layout={Layout.springify()}
        >
            <View variant="default" className="flex-1">
                <Animated.View
                    className="flex-1"
                    entering={enteringAnimation}
                    exiting={exitingAnimation}
                    layout={Layout.springify()}
                >
                    <View className="flex-1">
                        {children}
                    </View>
                </Animated.View>

                <BottomButton
                    enteringAnimation={enteringAnimation}
                    isFirstScreen={currentIndex === 0}
                    isLastScreen={currentIndex === totalScreens - 1}
                    onBack={onBack}
                    onNext={onNext}
                    canBack={canBack}
                    canSkip={canSkip}
                    enabledBackButton={enabledBackButton}
                    enabledNextButton={enabledNextButton}
                    showButtonBlock={showButtonBlock}
                />
            </View>
        </Animated.View>
    )
}