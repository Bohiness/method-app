// src/features/diary/mood/MoodCheckin.tsx
import { useCreateMoodCheckin, useEmotions, useFactors } from '@shared/hooks/diary/mood/useMoodCheckin'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'
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

interface MoodCheckinProps {
    date: Date
    onClose?: () => void
}

export const MoodCheckin: React.FC<MoodCheckinProps> = ({ date, onClose }) => {
    const [step, setStep] = useState(1)
    const [moodLevel, setMoodLevel] = useState(3)
    const [selectedEmotions, setSelectedEmotions] = useState<number[]>([])
    const [selectedFactors, setSelectedFactors] = useState<number[]>([])
    const [explanation, setExplanation] = useState('')
    const [notes, setNotes] = useState('')
    const [dateNow, setDateNow] = useState(date)

    const { data: emotions = [] } = useEmotions()
    const { data: factors = [] } = useFactors()
    const { mutateAsync: createMoodCheckin, isPending: isCreating } = useCreateMoodCheckin()

    // Звуковые эффекты
    const [sound, setSound] = useState<Audio.Sound>()

    useEffect(() => {
        loadSound()
        return () => {
            sound?.unloadAsync()
        }
    }, [])

    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('@assets/sounds/tap.mp3')
        )
        setSound(sound)
    }

    const playFeedback = async () => {
        try {
            await sound?.playFromPositionAsync(0)
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        } catch (error) {
            console.error('Error playing feedback:', error)
        }
    }

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

    const handleComplete = () => {
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

    // Рендер текущего шага
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <MoodLevelStep
                        value={moodLevel}
                        onChange={handleMoodLevelChange}
                        onNext={() => setStep(2)}
                        dateNow={dateNow}
                    />
                )
            case 2:
                return (
                    <EmotionsStep
                        moodLevel={moodLevel}
                        emotions={emotions}
                        selectedEmotions={selectedEmotions}
                        onSelect={handleEmotionSelect}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )
            case 3:
                return (
                    <FactorsStep
                        factors={factors}
                        selectedFactors={selectedFactors}
                        selectedEmotions={selectedEmotions}
                        onSelect={handleFactorSelect}
                        onNotesChange={setNotes}
                        onNext={() => setStep(4)}
                        emotions={emotions}
                        onBack={() => setStep(2)}
                        onRemoveEmotion={handleRemoveEmotion}
                    />
                )
            case 4:
                return (
                    <ExplanationStep
                        selectedFactors={selectedFactors}
                        selectedEmotions={selectedEmotions}
                        factors={factors}
                        emotions={emotions}
                        onExplanationChange={handleExplanationChange}
                        onRemoveEmotion={handleRemoveEmotion}
                        onRemoveFactor={handleRemoveFactor}
                        onNext={handleComplete}
                        onBack={() => setStep(3)}
                        explanation={explanation}
                        isLoading={isCreating}
                    />
                )
            case 5:
                return (
                    <SuccessStep
                        selectedFactors={selectedFactors}
                        selectedEmotions={selectedEmotions}
                        factors={factors}
                        emotions={emotions}
                        onClose={onClose}
                    />
                )
            default:
                return null
        }
    }

    return (
        <View className="flex-1 bg-white pt-10">
            {/* Индикатор прогресса */}
            <View className=" absolute top-7 left-1/2 transform -translate-x-1/2 flex flex-row justify-center gap-x-1">
                {[1, 2, 3, 4].map(i => (
                    <HapticTab
                        key={i}
                        className={`h-2 w-2 rounded-full ${step >= i ? 'bg-background-dark dark:bg-background' : 'bg-secondary-light dark:bg-secondary-dark'}`}
                        onPress={() => {
                            if (i < step) {
                                setStep(i)
                            }
                        }}
                    />
                ))}
            </View>
            <Animated.View
                className="flex-1"
            >
                {renderStep()}
            </Animated.View>
        </View>
    )
}
