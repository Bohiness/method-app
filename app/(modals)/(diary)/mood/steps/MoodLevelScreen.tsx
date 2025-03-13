import { BottomButton } from '@entities/modals/bottom-button'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from '@shared/ui/view'
import { MoodLevelStep } from '@widgets/diary/mood/steps/MoodLevelStep'
import { Audio } from 'expo-av'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { MoodStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodLevel'>

export function MoodLevelScreen({ route, navigation }: Props) {
    const { date } = route.params
    const [moodLevel, setMoodLevel] = useState(3)
    const [sound, setSound] = useState<Audio.Sound>()
    const [isNextEnabled, setIsNextEnabled] = useState(false)

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

    const handleMoodLevelChange = async (level: number) => {
        await playFeedback()
        setMoodLevel(level)
        setIsNextEnabled(level >= 1 && level <= 5)
        router.setParams({
            moodLevel: level
        })
    }

    const handleNextStep = async () => {
        if (isNextEnabled) {
            await playFeedback()
            navigation.navigate('Emotions', {
                moodLevel,
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
            <MoodLevelStep
                value={moodLevel}
                onChange={handleMoodLevelChange}
                dateNow={date}
                setEnabledNextButton={setIsNextEnabled}
                onNextStep={handleNextStep}
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

export default MoodLevelScreen 