import { BottomButton } from '@entities/modals/bottom-button'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEmotions } from '@shared/hooks/diary/mood/useEmotions'
import { Emotion } from '@shared/types/diary/mood/MoodType'
import { View } from '@shared/ui/view'
import { FactorsStep } from '@widgets/diary/mood/steps/FactorsStep'
import { Audio } from 'expo-av'
import { useCallback, useEffect, useState } from 'react'
import { MoodStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<MoodStackParamList, 'Factors'>

export function FactorsScreen({ route, navigation }: Props) {
    const { moodLevel, selectedEmotions, date } = route.params
    const [selectedFactors, setSelectedFactors] = useState<number[]>([])
    const [notes, setNotes] = useState('')
    const [sound, setSound] = useState<Audio.Sound>()
    const [isNextEnabled, setIsNextEnabled] = useState(true) // Факторы необязательны
    const { data: emotions } = useEmotions()

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

    const handleFactorSelect = async (id: number) => {
        await playFeedback()
        const newFactors = selectedFactors.includes(id)
            ? selectedFactors.filter(f => f !== id)
            : [...selectedFactors, id]
        setSelectedFactors(newFactors)
    }

    // Используем useCallback для мемоизации функции handleNotesChange
    const handleNotesChange = useCallback((text: string) => {
        setNotes(text)
    }, [])

    const handleRemoveEmotion = async (id: number) => {
        if (selectedEmotions.length > 1) {
            await playFeedback()
            // Поскольку мы не можем напрямую изменить selectedEmotions из route.params,
            // нам нужно перейти назад к экрану эмоций
            navigation.navigate('Emotions', {
                moodLevel,
                date
            })
        }
    }

    const handleNextStep = async () => {
        await playFeedback()
        navigation.navigate('Explanation', {
            moodLevel,
            selectedEmotions,
            selectedFactors,
            notes,
            date
        })
    }

    const handleBackStep = async () => {
        await playFeedback()
        navigation.goBack()
    }

    // Приведение типов для emotions, чтобы избежать ошибки типизации
    const emotionsData: Emotion[] = emotions as Emotion[] || []

    return (
        <View className="flex-1" variant='default'>
            <FactorsStep
                selectedFactors={selectedFactors}
                selectedEmotions={selectedEmotions}
                onSelect={handleFactorSelect}
                onNotesChange={handleNotesChange}
                emotions={emotionsData}
                onRemoveEmotion={handleRemoveEmotion}
                notes={notes}
                onNextStep={handleNextStep}
                onBackStep={handleBackStep}
            />
            <BottomButton
                onNext={handleNextStep}
                enabledNextButton={isNextEnabled}
                canSkip={false}
                canBack={false}
                showButtonBlock={true}
                onBack={handleBackStep}
            />
        </View>
    )
}

export default FactorsScreen 