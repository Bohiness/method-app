// StepNavigator.tsx
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCreateEveningReflection } from '@shared/hooks/diary/eveningreflection/useEveningReflection'
import { Title } from '@shared/ui/text'
import { SuccessStepEveningReflection } from '@widgets/diary/evening-reflection/screens/SuccessStep'
import { router, useNavigation } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EnhancedUniversalScreen } from './steps/EnhancedUniversalScreen'
import { HowIsYourDayScreen } from './steps/HowIsYourDay'

// Определяем типы для параметров навигации
export type EveningReflectionStackParamList = {
    HowIsYourDay: { date: Date }
    PositiveAspects: { date: Date }
    ImprovementAreas: { date: Date }
    LessonLearned: { date: Date }
    AdditionalThoughts: { date: Date }
    SuccessStepEveningReflection: {}
}

const Stack = createNativeStackNavigator<EveningReflectionStackParamList>()

// Тип для параметров компонента экрана
type ScreenProps = NativeStackScreenProps<EveningReflectionStackParamList, keyof EveningReflectionStackParamList>


interface StepNavigatorProps {
    date?: Date
    onStepChange?: (step: number) => void
}

export function StepNavigatorEveningReflection({ date = new Date(), onStepChange }: StepNavigatorProps) {
    const { t } = useTranslation()
    const { mutateAsync: createEveningReflection } = useCreateEveningReflection()
    const navigation = useNavigation()

    // Состояния для хранения ответов с каждого экрана
    const [screen1Response, setScreen1Response] = useState<number>(50)
    const [screen2Response, setScreen2Response] = useState<string>('')
    const [screen3Response, setScreen3Response] = useState<string>('')
    const [screen4Response, setScreen4Response] = useState<string>('')
    const [screen5Response, setScreen5Response] = useState<string>('')

    // Обновление параметров маршрута для отображения индикатора шагов
    const updateRouteParams = (step: number) => {
        // Вызываем функцию onStepChange для синхронизации с родительским компонентом
        if (onStepChange) {
            onStepChange(step)
        }

        // Также обновляем локальные параметры для внутренней навигации
        router.setParams({
            currentStep: step,
            totalSteps: 6
        })
    }

    // Функция для сохранения данных и завершения процесса
    const handleComplete = async () => {
        console.log({
            date,
            screen1Response,
            screen2Response,
            screen3Response,
            screen4Response,
            screen5Response,
        })
        await createEveningReflection({
            date: date.toISOString(),
            mood_score: screen1Response ?? null,
            positive_aspects: screen2Response ?? null,
            improvement_areas: screen3Response ?? null,
            lesson_learned: screen4Response ?? null,
            additional_thoughts: screen5Response ?? null,
        })
        navigation.navigate('SuccessStepEveningReflection')
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
                name="HowIsYourDay"
                initialParams={{ date }}
                component={HowIsYourDayScreen}
                listeners={{
                    focus: () => updateRouteParams(1)
                }}
            >
            </Stack.Screen>

            <Stack.Screen
                name="PositiveAspects"
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(2)
                }}
            >
                {(props) => (
                    <EnhancedUniversalScreen
                        topContent={
                            <Title align='center' className='mb-4'>
                                {t('diary.eveningreflection.question2.title')}
                            </Title>
                        }
                        inputValue={screen2Response}
                        onInputChange={setScreen2Response}
                        placeholder={t('diary.eveningreflection.question2.placeholder')}
                        navigation={props.navigation}
                        nextScreen="ImprovementAreas"
                    />
                )}
            </Stack.Screen>

            <Stack.Screen
                name="ImprovementAreas"
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(3)
                }}
            >
                {(props) => (
                    <EnhancedUniversalScreen
                        topContent={
                            <Title align='center' className='mb-4'>
                                {t('diary.eveningreflection.question3.title')}
                            </Title>
                        }
                        inputValue={screen3Response}
                        onInputChange={setScreen3Response}
                        placeholder={t('diary.eveningreflection.question3.placeholder')}
                        navigation={props.navigation}
                        nextScreen="LessonLearned"
                    />
                )}
            </Stack.Screen>

            <Stack.Screen
                name="LessonLearned"
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(4)
                }}
            >
                {(props) => (
                    <EnhancedUniversalScreen
                        topContent={
                            <Title align='center' className='mb-4'>
                                {t('diary.eveningreflection.question4.title')}
                            </Title>
                        }
                        inputValue={screen4Response}
                        onInputChange={setScreen4Response}
                        placeholder={t('diary.eveningreflection.question4.placeholder')}
                        navigation={props.navigation}
                        nextScreen="AdditionalThoughts"
                    />
                )}
            </Stack.Screen>

            <Stack.Screen
                name="AdditionalThoughts"
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(5)
                }}
            >
                {(props) => (
                    <EnhancedUniversalScreen
                        topContent={
                            <Title align='center' className='mb-4'>
                                {t('diary.eveningreflection.question5.title')}
                            </Title>
                        }
                        inputValue={screen5Response}
                        onInputChange={setScreen5Response}
                        placeholder={t('diary.eveningreflection.question5.placeholder')}
                        navigation={props.navigation}
                        nextScreen="SuccessStepEveningReflection"
                        isLastScreen={true}
                        onComplete={handleComplete}
                    />
                )}
            </Stack.Screen>

            <Stack.Screen
                name="SuccessStepEveningReflection"
                initialParams={{ date }}
                listeners={{
                    focus: () => updateRouteParams(6)
                }}
                component={SuccessStepEveningReflection}
            >
            </Stack.Screen>
        </Stack.Navigator>
    )
}