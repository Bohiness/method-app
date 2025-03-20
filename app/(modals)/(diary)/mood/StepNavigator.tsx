// StepNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { router } from 'expo-router'
import React from 'react'
import { EmotionsScreen } from './steps/EmotionsScreen'
import { ExplanationScreen } from './steps/ExplanationScreen'
import { FactorsScreen } from './steps/FactorsScreen'
import { MoodLevelScreen } from './steps/MoodLevelScreen'
import { SuccessScreen } from './steps/SuccessScreen'

// Определяем типы для параметров навигации
export type MoodStackParamList = {
    MoodLevel: { date: Date }
    Emotions: { moodLevel: number, date: Date }
    Factors: { moodLevel: number, selectedEmotions: number[], date: Date }
    Explanation: { moodLevel: number, selectedEmotions: number[], selectedFactors: number[], notes: string, date: Date }
    Success: { moodLevel: number, selectedEmotions: number[], selectedFactors: number[], explanation: string, notes: string, date: Date }
}

const Stack = createNativeStackNavigator<MoodStackParamList>()

interface StepNavigatorProps {
    date?: Date
    onStepChange?: (step: number) => void
}

export default function StepNavigatorMood({ date = new Date(), onStepChange }: StepNavigatorProps) {
    // Обновление параметров маршрута для отображения индикатора шагов
    const updateRouteParams = (step: number) => {
        // Вызываем функцию onStepChange для синхронизации с родительским компонентом
        if (onStepChange) {
            onStepChange(step)
        }

        // Также обновляем локальные параметры для внутренней навигации
        router.setParams({
            currentStep: step,
            totalSteps: 4
        })
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen
                name="MoodLevel"
                component={MoodLevelScreen}
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(1)
                }}
            />
            <Stack.Screen
                name="Emotions"
                component={EmotionsScreen}
                listeners={{
                    focus: () => updateRouteParams(2)
                }}
            />
            <Stack.Screen
                name="Factors"
                component={FactorsScreen}
                listeners={{
                    focus: () => updateRouteParams(3)
                }}
            />
            <Stack.Screen
                name="Explanation"
                component={ExplanationScreen}
                listeners={{
                    focus: () => updateRouteParams(4)
                }}
            />
            <Stack.Screen
                name="Success"
                component={SuccessScreen}
                options={{
                    gestureEnabled: false
                }}
            />
        </Stack.Navigator>
    )
}