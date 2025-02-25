import { HighlightedText } from '@shared/lib/utils/HighlightedText'
import { Emotion, Factor } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import { MultilineTextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, ScrollView, TouchableWithoutFeedback } from 'react-native'

// FactorsStep
interface FactorsStepProps {
    factors: Factor[]
    selectedFactors: number[]
    selectedEmotions: number[]
    onSelect: (id: number) => void
    onNotesChange: (text: string) => void
    emotions: Emotion[]
    onRemoveEmotion: (id: number) => void
}

export function FactorsStep({
    factors,
    selectedFactors,
    selectedEmotions,
    onSelect,
    onNotesChange,
    emotions,
    onRemoveEmotion
}: FactorsStepProps) {
    const { t } = useTranslation()
    const TitleWithHighlights = () => {
        const selectedEmotionsCount = selectedEmotions.length

        return (
            <View className="flex-row flex-wrap justify-center items-center mb-6 text-center">
                <Title className='inline-flex flex-row'>{t('diary.moodcheckin.step3.title')}</Title>
                {emotions
                    .filter(emotion => selectedEmotions.includes(emotion.id))
                    .map((emotion, index, arr) => (
                        <React.Fragment key={emotion.id}>
                            <HighlightedText
                                key={emotion.id}
                                text={emotion.name.toLowerCase()}
                                onRemove={onRemoveEmotion}
                                id={emotion.id}
                                canDelete={selectedEmotionsCount > 1}
                                isLast={index === arr.length - 1}
                            />
                            {index < arr.length - 1 && <Text>,</Text>}
                        </React.Fragment>
                    ))}
                <Title className='inline-flex flex-row'>?</Title>
            </View>
        )
    }

    return (
        <View className="flex-1 px-4" >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <TitleWithHighlights />

                    <MultilineTextInput
                        placeholder={t('diary.moodcheckin.step4.placeholder')}
                        multiline
                        onChangeText={onNotesChange}
                        containerClassName='mb-6'
                        voiceInput
                    />

                    <ScrollView
                        className="flex-1 mb-6"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-row flex-wrap gap-2 gap-y-4">
                            {factors
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((factor) => (
                                    <Button
                                        key={factor.id}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            onSelect(factor.id)
                                        }}
                                        variant={selectedFactors.includes(factor.id) ? "default" : "secondary"}
                                    >
                                        {factor.name}
                                    </Button>
                                ))
                            }
                        </View>
                    </ScrollView>
                </>
            </TouchableWithoutFeedback>
        </View >
    )
}