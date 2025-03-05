import { NavigationIndependentTree } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import React, { useLayoutEffect, useState } from 'react'
import { View } from 'react-native'
import { StepNavigatorMood } from './mood/StepNavigator'

export default function Mood() {
    const [currentStep, setCurrentStep] = useState(1)
    const navigation = useNavigation()

    // Используем useLayoutEffect вместо useEffect, чтобы обновление происходило перед рендерингом
    useLayoutEffect(() => {
        // Напрямую устанавливаем параметры для текущего роута
        (navigation as any).setParams({
            currentStep,
            totalSteps: 4,
        })
    }, [currentStep, navigation])

    // Функция для синхронизации шагов
    const syncStep = (step: number) => {
        console.log('Changing step to:', step) // Добавляем лог для отладки
        setCurrentStep(step)
    }

    return (
        <View className="flex-1 bg-background">
            <NavigationIndependentTree>
                <StepNavigatorMood date={new Date()} onStepChange={syncStep} />
            </NavigationIndependentTree>
        </View>
    )
}