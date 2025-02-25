import { useEffect, useState } from 'react'
import { SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated'
import { ScreenTransition } from './ScreenTransition'
import { TransitionScreen, useTransition } from './TransitionContext'
import { TransitionLayoutProps } from './TransitionLayout'


export const TransitionContent = ({ screens }: TransitionLayoutProps) => {
    const {
        currentScreen,
        setNextScreen,
        setPreviousScreen,
        currentIndex,
        enabledBackButton,
        enabledNextButton,
        setEnabledNextButton,
        setEnabledBackButton,
        transitionData,
        updateTransitionData
    } = useTransition()

    const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1)
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        setAnimate(true)
    }, [])

    const handleNext = () => {
        updateTransitionData({
            previousIndex: currentIndex,
            ...screenConfig?.props
        })
        setTransitionDirection(1)
        setNextScreen()
    }

    const handleBack = () => {
        const previousState = transitionData?.previousIndex === currentIndex - 1
            ? transitionData
            : {}
        setTransitionDirection(-1)
        setPreviousScreen()
    }

    const screenConfig = screens.find(s => s.key === currentScreen)
    if (!screenConfig || !screenConfig.component) {
        return null
    }

    const componentProps = {
        ...screenConfig.props,
        ...(transitionDirection === -1 ? transitionData : {}),
        onBack: handleBack,
        onNext: handleNext,
        setEnabledNextButton,
        setEnabledBackButton
    }

    const ScreenComponent = screenConfig.component

    // Разделяем анимационную обертку и контент
    return (
        <AnimatedWrapper
            direction={transitionDirection}
            animate={animate}
            currentIndex={currentIndex}
            totalScreens={screens.length}
            onNext={handleNext}
            onBack={handleBack}
            screenConfig={screenConfig}
            enabledBackButton={enabledBackButton}
            enabledNextButton={enabledNextButton}
        >
            {/* Контент не будет пересоздаваться при изменении direction */}
            <ScreenComponent
                onBack={handleBack}
                onNext={handleNext}
                setEnabledNextButton={setEnabledNextButton}
                setEnabledBackButton={setEnabledBackButton}
                {...componentProps}
            />
        </AnimatedWrapper>
    )
}

interface AnimatedWrapperProps {
    direction: 1 | -1
    animate: boolean
    children: React.ReactNode
    currentIndex: number
    totalScreens: number
    onNext: () => void
    onBack: () => void
    screenConfig: TransitionScreen
    enabledBackButton: boolean
    enabledNextButton: boolean
}

// Выносим анимационную обертку в отдельный компонент
const AnimatedWrapper = ({
    direction,
    animate,
    children,
    currentIndex,
    totalScreens,
    onNext,
    onBack,
    screenConfig,
    enabledBackButton,
    enabledNextButton
}: AnimatedWrapperProps) => {


    // Вычисляем анимации на основе direction
    const enteringAnimation = animate
        ? (direction > 0 ? SlideInRight : SlideInLeft)
        : undefined

    const exitingAnimation = animate
        ? (direction > 0 ? SlideOutLeft : SlideOutRight)
        : undefined

    console.log('enteringAnimation', enteringAnimation)
    console.log('exitingAnimation', exitingAnimation)

    console.log('animate', animate)
    console.log('direction', direction)
    console.log('currentIndex', currentIndex)
    console.log('totalScreens', totalScreens)
    console.log('enabledBackButton', enabledBackButton)
    console.log('enabledNextButton', enabledNextButton)
    // Анимационная обертка может пересоздаваться
    return (
        <ScreenTransition
            key={`animation-${direction}-${currentIndex}`}
            currentIndex={currentIndex}
            totalScreens={totalScreens}
            canBack={screenConfig.canBack}
            canSkip={screenConfig.canSkip}
            enabledBackButton={enabledBackButton}
            enabledNextButton={enabledNextButton}
            showButtonBlock={screenConfig.showButtonBlock}
            onNext={onNext}
            onBack={onBack}
            animate={animate}
            entering={enteringAnimation}
            exiting={exitingAnimation}
            {...(screenConfig.transitionOptions ?? {})}
        >
            {children}
        </ScreenTransition>
    )
}