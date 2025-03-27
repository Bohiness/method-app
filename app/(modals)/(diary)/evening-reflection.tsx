import { ModalFullScreenContent } from '@entities/modals/modal-full-screen-content'
import { StepIndicator } from '@entities/modals/StepIndicator'
import { NavigationIndependentTree, useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useLayoutEffect, useState } from 'react'
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
        <NavigationIndependentTree>
            <ModalFullScreenContent
                headerOnClose={() => {
                    router.dismissTo('/(tabs)')
                }}
                headerCenterContent={
                    <StepIndicator
                        currentStep={currentStep}
                        onStepPress={syncStep}
                        totalSteps={6}
                    />
                }
            >
                <StepNavigatorEveningReflection date={new Date()} onStepChange={syncStep} />
            </ModalFullScreenContent>
        </NavigationIndependentTree>

    )
}