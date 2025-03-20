import { NavigationIndependentTree, useNavigation } from '@react-navigation/native'
import React, { useLayoutEffect, useState } from 'react'
import { View } from 'react-native'
import StepNavigatorStartYourDay from './start-your-day/StepNavigator'

export default function StartYourDayScreen() {
    const [currentStep, setCurrentStep] = useState(1)
    const navigation = useNavigation()

    useLayoutEffect(() => {
        (navigation as any).setParams({
            currentStep,
            totalSteps: 4,
        })
    }, [currentStep, navigation])

    // Функция для синхронизации шагов
    const syncStep = (step: number) => {
        console.log('Changing step to:', step)
        setCurrentStep(step)
    }
    return (
        <View className="flex-1 bg-background">
            <NavigationIndependentTree>
                <StepNavigatorStartYourDay date={new Date()} onStepChange={syncStep} />
            </NavigationIndependentTree>
        </View>
    )
}