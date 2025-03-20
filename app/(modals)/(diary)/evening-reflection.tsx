import { NavigationIndependentTree, useNavigation } from '@react-navigation/native'
import { View } from '@shared/ui/view'
import React, { useLayoutEffect, useState } from 'react'
import StepNavigatorEveningReflection from './evening-reflection/StepNavigator'

export default function EveningReflection() {
    const [currentStep, setCurrentStep] = useState(1)
    const navigation = useNavigation()

    // Используем useLayoutEffect вместо useEffect, чтобы обновление происходило перед рендерингом
    useLayoutEffect(() => {
        // Используем router.setParams вместо navigation.setParams для expo-router
        (navigation as any).setParams({
            currentStep,
            totalSteps: 6,
        })
    }, [currentStep, navigation])

    // Функция для синхронизации шагов
    const syncStep = (step: number) => {
        setCurrentStep(step)
    }
    return (
        <View className="flex-1">
            <NavigationIndependentTree>
                <StepNavigatorEveningReflection date={new Date()} onStepChange={syncStep} />
            </NavigationIndependentTree>
        </View>
    )
}