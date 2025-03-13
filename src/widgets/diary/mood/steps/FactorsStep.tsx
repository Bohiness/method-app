import { HighlightedText } from '@shared/lib/utils/HighlightedText'
import { Emotion } from '@shared/types/diary/mood/MoodType'
import { Text, Title } from '@shared/ui/text'
import { MultilineTextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { FactorsScrollView } from '@widgets/diary/factors/FactorsScrollView'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'

// FactorsStep
interface FactorsStepProps {
    selectedFactors: number[]
    selectedEmotions: number[]
    onSelect: (id: number) => void
    onNotesChange: (text: string) => void
    emotions: Emotion[]
    onRemoveEmotion: (id: number) => void
    notes?: string
    onNextStep?: () => void
    onBackStep?: () => void
}

export function FactorsStep({
    selectedFactors,
    selectedEmotions,
    onSelect,
    onNotesChange,
    emotions,
    onRemoveEmotion,
    notes = '',
    onNextStep,
    onBackStep
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
                        value={notes}
                    />

                    <FactorsScrollView
                        selectedFactors={selectedFactors}
                        onSelect={onSelect}
                        iconView
                    />

                </>
            </TouchableWithoutFeedback>
        </View >
    )
}