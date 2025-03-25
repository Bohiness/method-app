// src/features/onboarding/context/OnboardingContext.tsx
import { useUser } from '@shared/context/user-provider'
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { logger } from '@shared/lib/logger/logger.service'
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
    loading: boolean
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
    const { showSubscriptionModal } = useSubscriptionModal()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
    const [loading, setLoading] = useState(false)

    const currentScreen = screenKeys[currentIndex]
    const isLastScreen = currentIndex === screenKeys.length - 1

    const { updateUser } = useUser()

    const setNextScreen = () => {
        setLoading(true)
        if (currentIndex < screenKeys.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
        setLoading(false)
    }

    const setPreviousScreen = () => {
        setLoading(true)
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
        setLoading(false)
    }

    const goToScreen = (screenId: string) => {
        setLoading(true)
        const index = screenKeys.indexOf(screenId)
        if (index !== -1) {
            setCurrentIndex(index)
        }
        setLoading(false)
    }

    // Добавляем функцию обновления данных
    const updateOnboardingData = (data: Partial<OnboardingData>) => {
        setOnboardingData(prev => ({ ...prev, ...data }))
    }

    const completeOnboarding = async () => {
        setLoading(true)
        try {
            // Сохраняем собранные данные
            await storage.set('onboarding-data', onboardingData)
            // Помечаем онбординг как завершенный
            await storage.set('onboarding-completed', true)
            // Обновляем профиль пользователя с проверкой
            const userData = {
                first_name: onboardingData.first_name,
                gender: onboardingData.gender as Gender,
            }

            try {
                await updateUser(userData)
            } catch (userError) {
                logger.warn(userError, 'onboarding – completeOnboarding', 'Failed to update user data:')
            }

            // Перенаправляем на основной экран
            router.replace('/(tabs)')
            showSubscriptionModal({ plan: 'premium_ai' })
        } catch (error) {
            console.error('Failed to complete onboarding:', error)
            throw error
        } finally {
            setLoading(false)
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
                updateOnboardingData,
                loading
            }}
        >
            {children}
        </OnboardingContext.Provider>
    )
}