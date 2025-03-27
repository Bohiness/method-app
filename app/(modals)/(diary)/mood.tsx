import { ModalFullScreenContent } from '@entities/modals/modal-full-screen-content'
import { StepIndicator } from '@entities/modals/StepIndicator'
import { NavigationIndependentTree } from '@react-navigation/native'
import { router, useNavigation } from 'expo-router'
import { useLayoutEffect, useState } from 'react'
import StepNavigatorMood from './mood/StepNavigator'

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

        <NavigationIndependentTree>
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
                }>
                <StepNavigatorMood date={new Date()} onStepChange={syncStep} />
            </ModalFullScreenContent>
        </NavigationIndependentTree>

    )
}