// src/features/onboarding/context/OnboardingContext.tsx
import { useUser } from '@shared/context/user-provider'
import { storage } from '@shared/lib/storage/storage.service'
import { Gender } from '@shared/types/user/UserType'
import { router } from 'expo-router'
import React, { createContext, useContext, useState } from 'react'
import { OnboardingData } from '../types/OnboardingTypes'

// Расширяем существующий интерфейс контекста
interface OnboardingContextType {
    currentScreen: string
    setNextScreen: () => void
    setPreviousScreen: () => void
    completeOnboarding: () => Promise<void>
    goToScreen: (screenId: string) => void
    currentIndex: number
    isLastScreen: boolean
    screens: string[]
    onboardingData: OnboardingData
    updateOnboardingData: (data: Partial<OnboardingData>) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const useOnboarding = () => {
    const context = useContext(OnboardingContext)
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider')
    }
    return context
}

interface OnboardingProviderProps {
    children: React.ReactNode
    screenKeys: string[]
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children, screenKeys }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({})

    const currentScreen = screenKeys[currentIndex]
    const isLastScreen = currentIndex === screenKeys.length - 1

    const { updateUser } = useUser()

    const setNextScreen = () => {
        if (currentIndex < screenKeys.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const setPreviousScreen = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    const goToScreen = (screenId: string) => {
        const index = screenKeys.indexOf(screenId)
        if (index !== -1) {
            setCurrentIndex(index)
        }
    }

    // Добавляем функцию обновления данных
    const updateOnboardingData = (data: Partial<OnboardingData>) => {
        setOnboardingData(prev => ({ ...prev, ...data }))
    }

    const completeOnboarding = async () => {
        try {
            // Сохраняем собранные данные
            await storage.set('onboarding-data', onboardingData)
            // Помечаем онбординг как завершенный
            await storage.set('onboarding-completed', true)
            // Обновляем профиль пользователя
            await updateUser({
                first_name: onboardingData.first_name,
                gender: onboardingData.gender as Gender,
            })
            // Перенаправляем на основной экран
            router.replace('/(tabs)')
        } catch (error) {
            console.error('Failed to complete onboarding:', error)
            throw error
        }
    }

    return (
        <OnboardingContext.Provider
            value={{
                currentScreen,
                setNextScreen,
                setPreviousScreen,
                completeOnboarding,
                goToScreen,
                currentIndex,
                isLastScreen,
                screens: screenKeys,
                onboardingData,
                updateOnboardingData
            }}
        >
            {children}
        </OnboardingContext.Provider>
    )
}