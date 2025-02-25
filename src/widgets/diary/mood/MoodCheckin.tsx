// src/features/diary/mood/MoodCheckin.tsx
import { useEmotions } from '@shared/hooks/diary/mood/useEmotions'
import { useFactors } from '@shared/hooks/diary/mood/useFactors'
import { useCreateMoodCheckin } from '@shared/hooks/diary/mood/useMoodCheckin'
import { TransitionScreen, TransitionScreenProps } from '@widgets/transitions/TransitionContext'
import { TransitionLayout } from '@widgets/transitions/TransitionLayout'
import { Audio } from 'expo-av'
import React, { useEffect, useState } from 'react'
import { EmotionsStep } from './steps/EmotionsStep'
import { ExplanationStep } from './steps/ExplanationStep'
import { FactorsStep } from './steps/FactorsStep'
import { MoodLevelStep } from './steps/MoodLevelStep'
import { SuccessStep } from './steps/SuccessStep'

// Определяем типы для эмоций и факторов
type Emotion = {
    id: number
    name: string
    mood_level: number
}

type Factor = {
    id: number
    name: string
}

export interface MoodRouteParams {
    currentStep?: number
    onStepPress?: (newStep: number) => void
    totalSteps?: number
}

interface MoodCheckinProps {
    date: Date
    onClose?: () => void
}

export const MoodCheckin: React.FC<MoodCheckinProps> = ({ date }) => {
    const [step, setStep] = useState(1)
    const [moodLevel, setMoodLevel] = useState(3)
    const [selectedEmotions, setSelectedEmotions] = useState<number[]>([])
    const [selectedFactors, setSelectedFactors] = useState<number[]>([])
    const [explanation, setExplanation] = useState('')
    const [notes, setNotes] = useState('')
    const [dateNow, setDateNow] = useState(date)

    const { data: emotions = [] } = useEmotions()
    const { data: factors = [] } = useFactors()
    const { mutateAsync: createMoodCheckin } = useCreateMoodCheckin()

    // Звуковые эффекты
    const [sound, setSound] = useState<Audio.Sound>()

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

    // Сброс состояния при монтировании компонента
    useEffect(() => {
        setStep(1)
        setMoodLevel(3)
        setSelectedEmotions([])
        setSelectedFactors([])
        setExplanation('')
        setNotes('')
        setDateNow(date)
    }, [date])

    // Обработчики для каждого шага
    const handleMoodLevelChange = async (level: number) => {
        await playFeedback()
        setMoodLevel(level)
    }

    const handleEmotionSelect = async (id: number) => {
        await playFeedback()
        setSelectedEmotions(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
    }

    const handleFactorSelect = async (id: number) => {
        await playFeedback()
        setSelectedFactors(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        )
    }

    const handleExplanationChange = async (text: string) => {
        setExplanation(text)
    }

    const handleRemoveEmotion = async (id: number) => {
        if (selectedEmotions.length > 1) {
            await playFeedback()
            setSelectedEmotions(prev => prev.filter(e => e !== id))
        }
    }

    const handleRemoveFactor = async (id: number) => {
        if (selectedFactors.length > 1) {
            await playFeedback()
            setSelectedFactors(prev => prev.filter(f => f !== id))
        }
    }

    const handleComplete = async () => {
        // Запускаем мутацию без await
        createMoodCheckin({
            mood_level: moodLevel,
            emotions: selectedEmotions,
            factors: selectedFactors,
            factor_review_notes: notes,
            factor_emotion_review_notes: explanation,
            date: dateNow
        }, {
            // Используем колбэки для обработки результатов
            onSuccess: () => {
                console.log('Mood checkin saved successfully')
            },
            onError: (error) => {
                console.error('Error saving mood checkin:', error)
                // Здесь можно показать уведомление об ошибке
            }
        })

        // Сразу играем звук и переходим к экрану успеха
        playFeedback()
        setStep(5)
    }


    const screens: TransitionScreen[] = [
        {
            key: 'screen-1',
            component: MoodLevelStep as React.ComponentType<TransitionScreenProps>,
            canSkip: false,
            canBack: false,
            props: {
                value: moodLevel,
                onChange: handleMoodLevelChange,
                dateNow: dateNow,
            }
        },
        {
            key: 'screen-2',
            component: EmotionsStep as React.ComponentType<TransitionScreenProps>,
            canSkip: false,
            props: {
                emotions: emotions,
                selectedEmotions: selectedEmotions,
                onSelect: handleEmotionSelect,
                moodLevel: moodLevel,
            }
        },
        {
            key: 'screen-3',
            component: FactorsStep as React.ComponentType<TransitionScreenProps>,
            canSkip: true,
            props: {
                factors: factors,
                selectedFactors: selectedFactors,
                selectedEmotions: selectedEmotions,
                onSelect: handleFactorSelect,
                onNotesChange: setNotes,
                emotions: emotions,
                onRemoveEmotion: handleRemoveEmotion
            }
        },
        {
            key: 'screen-4',
            component: ExplanationStep as React.ComponentType<TransitionScreenProps>,
            props: {
                selectedFactors: selectedFactors,
                selectedEmotions: selectedEmotions,
                factors: factors,
                emotions: emotions,
                onExplanationChange: handleExplanationChange,
                onRemoveEmotion: handleRemoveEmotion,
                onRemoveFactor: handleRemoveFactor,
                explanation: explanation,
            },
            canSkip: true,
        },
        {
            key: 'screen-5',
            component: SuccessStep,
            canSkip: false,
            canBack: false,
            showButtonBlock: false,
        },
    ]

    return (
        <TransitionLayout screens={screens} onComplete={handleComplete} />
    )
}