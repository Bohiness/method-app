// src/features/diary/mood/MoodCheckin.tsx
import { useMoodCheckin } from '@shared/hooks/diary/mood/useMoodCheckin'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated, {
    SlideInRight,
    SlideOutLeft
} from 'react-native-reanimated'
import { EmotionsStep } from './steps/EmotionsStep'
import { FactorsStep } from './steps/FactorsStep'
import { MoodLevelStep } from './steps/MoodLevelStep'

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
}

export const MoodCheckin: React.FC<MoodCheckinProps> = ({ date }) => {
    const [step, setStep] = useState(1)
    const [moodLevel, setMoodLevel] = useState(3)
    const [selectedEmotions, setSelectedEmotions] = useState<number[]>([])
    const [selectedFactors, setSelectedFactors] = useState<number[]>([])
    const [notes, setNotes] = useState('')

    const { emotions, factors, createMoodCheckin, isCreating } = useMoodCheckin()

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

    const handleComplete = async () => {
        try {
            await createMoodCheckin({
                mood_level: moodLevel,
                emotions: selectedEmotions,
                factors: selectedFactors,
                notes: notes
            })

            await playFeedback()
            onComplete?.()
        } catch (error) {
            console.error('Error saving mood checkin:', error)
        }
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
                    />
                )
            case 2:
                return (
                    <EmotionsStep
                        emotions={emotions?.filter(e => e.mood_level === moodLevel) || []}
                        selectedEmotions={selectedEmotions}
                        onSelect={handleEmotionSelect}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )
            case 3:
                return (
                    <FactorsStep
                        factors={factors || []}
                        selectedFactors={selectedFactors}
                        onSelect={handleFactorSelect}
                        onNotesChange={setNotes}
                        onComplete={handleComplete}
                        onBack={() => setStep(2)}
                        isLoading={isCreating}
                    />
                )
            default:
                return null
        }
    }

    return (
        <View className="flex-1 bg-white">
            <Animated.View
                className="flex-1"
                entering={SlideInRight}
                exiting={SlideOutLeft}
            >
                {renderStep()}
            </Animated.View>

            {/* Индикатор прогресса */}
            <View className="flex-row justify-center space-x-2 pb-4">
                {[1, 2, 3].map(i => (
                    <View
                        key={i}
                        className={`h-2 w-2 rounded-full ${step >= i ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                    />
                ))}
            </View>
        </View>
    )
}


