// src/features/onboarding/context/OnboardingContext.tsx
import React, { createContext, useContext, useState } from 'react'
import { ScreenTransitionProps } from './ScreenTransition'

// src/features/onboarding/types/OnboardingTypes.ts
export interface TransitionScreen<P = TransitionScreenProps> {
    key: string
    component: React.ComponentType<P>
    props?: P
    canSkip?: boolean
    canBack?: boolean
    enabledBackButton?: boolean
    enabledNextButton?: boolean
    showButtonBlock?: boolean
    setEnabledBackButton?: (enabled: boolean) => void
    setEnabledNextButton?: (enabled: boolean) => void
    transitionOptions?: Partial<ScreenTransitionProps>
}

export interface TransitionScreenProps {
    onNext?: () => void
    onBack?: () => void
    loading?: boolean
    nextButtonText?: string
    setEnabledNextButton?: (enabled: boolean) => void
    setEnabledBackButton?: (enabled: boolean) => void
}

export interface TransitionData {
    [key: string]: any
}

// Расширяем существующий интерфейс контекста
interface TransitionContextType {
    currentScreen: string
    setNextScreen: () => void
    setPreviousScreen: () => void
    completeTransition: () => void
    goToScreen: (screenId: string) => void
    currentIndex: number
    isLastScreen: boolean
    screens: string[]
    transitionData: TransitionData
    enabledBackButton: boolean
    enabledNextButton: boolean
    setEnabledBackButton: (enabled: boolean) => void
    setEnabledNextButton: (enabled: boolean) => void
    updateTransitionData: (data: Partial<TransitionData>) => void
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined)

export const useTransition = () => {
    const context = useContext(TransitionContext)
    if (!context) {
        throw new Error('useTransition must be used within TransitionProvider')
    }
    return context
}

interface TransitionProviderProps {
    children: React.ReactNode
    screenKeys: string[]
    onComplete?: () => Promise<void>
}

export const TransitionProvider: React.FC<TransitionProviderProps> = ({
    children,
    screenKeys,
    onComplete
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [transitionData, setTransitionData] = useState<TransitionData>({})

    const [enabledBackButton, setEnabledBackButton] = useState(false)
    const [enabledNextButton, setEnabledNextButton] = useState(false)

    const currentScreen = screenKeys[currentIndex]
    const isLastScreen = currentIndex === screenKeys.length - 1


    const resetEnabledButtons = () => {
        setEnabledBackButton(false)
        setEnabledNextButton(false)
    }

    const setNextScreen = () => {
        if (currentIndex < screenKeys.length - 1) {
            setCurrentIndex(prev => prev + 1)
            resetEnabledButtons()
        }
    }

    const setPreviousScreen = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
            resetEnabledButtons()
        }
    }

    const goToScreen = (screenId: string) => {
        const index = screenKeys.indexOf(screenId)
        if (index !== -1) {
            setCurrentIndex(index)
            resetEnabledButtons()
        }
    }

    const updateTransitionData = (data: Partial<TransitionData>) => {
        setTransitionData(prev => ({ ...prev, ...data }))
    }

    const completeTransition = () => {
        console.log('completeTransition')
        if (onComplete) {
            onComplete()
        }
    }

    return (
        <TransitionContext.Provider
            value={{
                currentScreen,
                setNextScreen,
                setPreviousScreen,
                completeTransition,
                goToScreen,
                currentIndex,
                isLastScreen,
                screens: screenKeys,
                enabledBackButton,
                enabledNextButton,
                setEnabledBackButton,
                setEnabledNextButton,
                transitionData,
                updateTransitionData,
            }}
        >
            {children}
        </TransitionContext.Provider>
    )
}