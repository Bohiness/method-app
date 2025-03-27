import { ModalFullScreenContent } from '@entities/modals/modal-full-screen-content'
import { StepIndicator } from '@entities/modals/StepIndicator'
import { NavigationIndependentTree, useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useLayoutEffect, useState } from 'react'
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
        <ModalFullScreenContent
            headerOnClose={() => {
                router.dismissTo('/(tabs)')
            }}
            headerCenterContent={
                <StepIndicator
                    currentStep={currentStep}
                    onStepPress={syncStep}
                    totalSteps={4}
                />
            }
        >
            <NavigationIndependentTree>
                <StepNavigatorStartYourDay date={new Date()} onStepChange={syncStep} />
            </NavigationIndependentTree>
        </ModalFullScreenContent>
    )
}