import { BottomButton } from '@entities/modals/bottom-button'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEmotions } from '@shared/hooks/diary/mood/useEmotions'
import { View } from '@shared/ui/view'
import { EmotionsStep } from '@widgets/diary/mood/steps/EmotionsStep'
import { Audio } from 'expo-av'
import { useEffect, useState } from 'react'
import { MoodStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<MoodStackParamList, 'Emotions'>

export function EmotionsScreen({ route, navigation }: Props) {
    const { moodLevel, date } = route.params
    const [selectedEmotions, setSelectedEmotions] = useState<number[]>([])
    const [sound, setSound] = useState<Audio.Sound>()
    const [isNextEnabled, setIsNextEnabled] = useState(false)
    const { data: emotions } = useEmotions()

    // Загрузка звукового эффекта
    useEffect(() => {
        loadSound()
        return () => {
            sound?.unloadAsync()
        }
    }, [])

    // Проверяем, выбрана ли хотя бы одна эмоция
    useEffect(() => {
        setIsNextEnabled(selectedEmotions.length > 0)
    }, [selectedEmotions])

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

    const handleEmotionSelect = async (id: number) => {
        await playFeedback()
        const newEmotions = selectedEmotions.includes(id)
            ? selectedEmotions.filter(e => e !== id)
            : [...selectedEmotions, id]
        setSelectedEmotions(newEmotions)
    }

    const handleNextStep = async () => {
        if (isNextEnabled) {
            await playFeedback()
            navigation.navigate('Factors', {
                moodLevel,
                selectedEmotions,
                date
            })
        }
    }

    const handleBackStep = async () => {
        await playFeedback()
        navigation.goBack()
    }

    return (
        <View className="flex-1" variant='default'>
            <EmotionsStep
                emotions={emotions || []}
                selectedEmotions={selectedEmotions}
                onSelect={handleEmotionSelect}
                moodLevel={moodLevel}
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

export default EmotionsScreen 