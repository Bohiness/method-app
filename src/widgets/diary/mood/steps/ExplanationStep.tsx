import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { HighlightedText } from '@shared/lib/utils/parsers/HighlightedText'
import { Emotion, Factor } from '@shared/types/diary/mood/MoodType'
import { Title } from '@shared/ui/text'
import { MultilineTextInput } from '@shared/ui/text-input'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native'
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated'

interface ExplanationStepProps {
    selectedFactors: number[]
    selectedEmotions: number[]
    factors: Factor[]
    emotions: Emotion[]
    onExplanationChange: (text: string) => void
    onRemoveEmotion: (id: number) => void
    onRemoveFactor: (id: number) => void
    explanation: string
    onComplete?: () => void
    onBackStep?: () => void
}

export function ExplanationStep({
    selectedFactors,
    selectedEmotions,
    factors,
    emotions,
    onExplanationChange,
    onRemoveEmotion,
    onRemoveFactor,
    explanation,
    onComplete,
    onBackStep
}: ExplanationStepProps) {
    const [showNextButton, setShowNextButton] = useState(false)
    const { t } = useTranslation()
    const { isKeyboardVisible, dismissKeyboard } = useKeyboard()

    console.log('ExplanationStep', selectedFactors)


    const TitleWithHighlights = () => {
        const selectedEmotionsCount = selectedEmotions.length
        const selectedFactorsCount = selectedFactors.length

        return (
            <View className="flex-row flex-wrap justify-center items-center text-center">
                {selectedFactors && selectedFactors.length > 0 ? (
                    <View className="flex-row flex-wrap justify-center items-center mb-6 text-center">
                        <Title className='inline-flex flex-row'>{t('diary.moodcheckin.step4.title1')}</Title>

                        {factors
                            .filter(factor => selectedFactors.includes(factor.id))
                            .map((factor, index, arr) => (
                                <React.Fragment key={factor.id}>
                                    <HighlightedText
                                        key={factor.id}
                                        text={factor.name.toLowerCase()}
                                        onRemove={onRemoveFactor}
                                        id={factor.id}
                                        canDelete={selectedFactorsCount > 1}
                                        isLast={index === arr.length - 1}
                                    />
                                </React.Fragment>
                            ))}
                        <Title className='inline-flex flex-row'>{t('diary.moodcheckin.step4.title2')}</Title>
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
                                </React.Fragment>
                            ))}
                        <Title className='inline-flex flex-row'>?</Title>
                    </View>
                ) : (
                    <View className="flex-row flex-wrap justify-center items-center mb-6 text-center">
                        <Title className='inline-flex flex-row'>{t('diary.moodcheckin.step4.titleNoFactors')}</Title>
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
                                </React.Fragment>
                            ))}
                        <Title className='inline flex-row text-center'>?</Title>
                        <Title className='inline flex-row text-center'>{t('diary.moodcheckin.step4.titleNoFactors2')}</Title>
                    </View>
                )}
            </View>
        )
    }

    useEffect(() => {
        setShowNextButton(explanation.trim().length > 0)
    }, [explanation])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 px-4"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <Pressable
                className="flex-1"
                onPress={dismissKeyboard}
            >
                <Animated.View
                    className="flex-1"
                    entering={SlideInRight}
                    exiting={SlideOutLeft}
                >
                    <TitleWithHighlights />

                    <View className="flex-1">
                        <MultilineTextInput
                            placeholder={t('diary.moodcheckin.step4.placeholder')}
                            showCount
                            maxLength={1000}
                            value={explanation}
                            onChangeText={onExplanationChange}
                            flex
                            voiceInput
                        />
                    </View>

                </Animated.View>
            </Pressable>
        </KeyboardAvoidingView >
    )
}