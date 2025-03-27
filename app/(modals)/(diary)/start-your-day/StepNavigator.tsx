// StepNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { router } from 'expo-router'
import PlansForDay from './steps/PlansForDay'
import PriorityForDayScreen from './steps/PriorityForDayScreen'
import SleepQualityStepScreen from './steps/SleepQualityStepScreen'
import SuccessStepStartYourDay from './steps/SuccessStepStartYourDay'
// Определяем типы для параметров навигации
export type StartYourDayStackParamList = {
    SleepQualityStep: { date: Date }
    PriorityForDay: { date: Date, sleepQuality: number }
    PlansForDay: { date: Date, sleepQuality: number, factors: number[] }
    SuccessStepStartYourDay: { date: Date, sleepQuality: number, factors: number[], planForDay: string, startDayId: string }
}

const Stack = createNativeStackNavigator<StartYourDayStackParamList>()

interface StepNavigatorProps {
    date?: Date
    onStepChange?: (step: number) => void
}

export default function StepNavigatorStartYourDay({ date = new Date(), onStepChange }: StepNavigatorProps) {
    // Обновление параметров маршрута для отображения индикатора шагов
    const updateRouteParams = (step: number) => {
        if (onStepChange) {
            onStepChange(step)
        }
        router.setParams({
            currentStep: step,
            totalSteps: 5
        })
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'simple_push',
                gestureEnabled: true,
                sheetExpandsWhenScrolledToEdge: false,
                headerShadowVisible: false,
                fullScreenGestureShadowEnabled: false,
                animationTypeForReplace: 'push',
                contentStyle: {
                    backgroundColor: 'transparent',
                },
            }}
        >
            <Stack.Screen
                name="SleepQualityStep"
                component={SleepQualityStepScreen}
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(1)
                }}
            />
            <Stack.Screen
                name="PriorityForDay"
                component={PriorityForDayScreen}
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(2)
                }}
            />
            <Stack.Screen
                name="PlansForDay"
                initialParams={{ date }}
                component={PlansForDay}
                listeners={{
                    focus: () => updateRouteParams(4)
                }}
            >
            </Stack.Screen>
            <Stack.Screen
                name="SuccessStepStartYourDay"
                component={SuccessStepStartYourDay}
                listeners={{
                    focus: () => updateRouteParams(5)
                }}
            />
        </Stack.Navigator>
    )
}
