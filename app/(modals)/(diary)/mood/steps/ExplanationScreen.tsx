import { BottomButton } from '@entities/modals/bottom-button'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEmotions } from '@shared/hooks/diary/mood/useEmotions'
import { useFactors } from '@shared/hooks/diary/mood/useFactors'
import { useCreateMoodCheckin } from '@shared/hooks/diary/mood/useMoodCheckin'
import { View } from '@shared/ui/view'
import { ExplanationStep } from '@widgets/diary/mood/steps/ExplanationStep'
import { Audio } from 'expo-av'
import React, { useEffect, useState } from 'react'
import { MoodStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<MoodStackParamList, 'Explanation'>

export function ExplanationScreen({ route, navigation }: Props) {
    const { moodLevel, selectedEmotions, selectedFactors, notes, date } = route.params
    const [explanation, setExplanation] = useState('')
    const [sound, setSound] = useState<Audio.Sound>()
    const [isNextEnabled, setIsNextEnabled] = useState(true) // Объяснение необязательно
    const [isLoading, setIsLoading] = useState(false)
    const { factors } = useFactors()
    const { data: emotions } = useEmotions()
    const { mutateAsync: createMoodCheckin } = useCreateMoodCheckin()

    // Загрузка звукового эффекта
    useEffect(() => {
        loadSound()
        return () => {
            sound?.unloadAsync()
        }
    }, [])

    const loadSound = async () => {
        try {
            const { sound: loadedSound } = await Audio.Sound.createAsync(
                require('@assets/sounds/tap.mp3')
            )
            setSound(loadedSound)
        } catch (error) {
            console.error('Error loading sound:', error)
        }
    }

    const playFeedback = async () => {
        try {
            await sound?.playFromPositionAsync(0)
        } catch (error) {
            console.error('Error playing feedback:', error)
        }
    }

    const handleExplanationChange = (text: string) => {
        setExplanation(text)
    }

    const handleRemoveEmotion = async (id: number) => {
        if (selectedEmotions.length > 1) {
            await playFeedback()
            // Перейти назад к экрану эмоций
            navigation.navigate('Emotions', {
                moodLevel,
                date
            })
        }
    }

    const handleRemoveFactor = async (id: number) => {
        if (selectedFactors.length > 1) {
            await playFeedback()
            // Перейти назад к экрану факторов
            navigation.navigate('Factors', {
                moodLevel,
                selectedEmotions,
                date
            })
        }
    }

    const handleComplete = async () => {
        try {
            await playFeedback()
            setIsLoading(true)

            // Создаем объект данных для отправки
            const moodCheckinData = {
                mood_level: moodLevel,
                emotions: selectedEmotions,
                factors: selectedFactors,
                factor_review_notes: notes || '',
                factor_emotion_review_notes: explanation || '',
                date: date
            }

            console.log('Отправляем данные в createMoodCheckin:', moodCheckinData)

            // Запускаем мутацию
            const data = await createMoodCheckin(moodCheckinData)

            // Обрабатываем успешный результат
            console.log('Mood checkin saved successfully', data)
            setIsLoading(false)

            // Переход к экрану успеха
            navigation.navigate('Success', {
                moodLevel,
                selectedEmotions,
                selectedFactors,
                explanation,
                notes,
                date
            })
        } catch (error) {
            console.error('Error saving mood checkin:', error)
            setIsLoading(false)

            // Более подробное логирование ошибки
            if (error instanceof Error) {
                console.error('Error message:', error.message)
                console.error('Error stack:', error.stack)
            }
        }
    }

    const handleBackStep = async () => {
        await playFeedback()
        navigation.goBack()
    }

    return (
        <View className="flex-1" variant='default'>
            <ExplanationStep
                selectedFactors={selectedFactors}
                selectedEmotions={selectedEmotions}
                factors={factors || []}
                emotions={emotions || []}
                onExplanationChange={handleExplanationChange}
                onRemoveEmotion={handleRemoveEmotion}
                onRemoveFactor={handleRemoveFactor}
                explanation={explanation}
                onComplete={handleComplete}
                onBackStep={handleBackStep}
            />
            <BottomButton
                onNext={handleComplete}
                enabledNextButton={isNextEnabled}
                canSkip={false}
                canBack={false}
                showButtonBlock={true}
                onBack={handleBackStep}
            />
        </View>
    )
}

export default ExplanationScreen 