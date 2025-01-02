import { useKeyboardStatus } from '@shared/hooks/systems/keyboard/useKeyboardStatus'
import { HighlightedText } from '@shared/lib/utils/HighlightedText'
import { Emotion, Factor } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/styled-text'
import { MultilineTextInput } from '@shared/ui/text-input'
import { VoiceInputButton } from '@shared/ui/voice/VoiceInputButton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated'

interface ExplanationStepProps {
    selectedFactors: number[]
    selectedEmotions: number[]
    factors: Factor[]
    emotions: Emotion[]
    onExplanationChange: (text: string) => void
    onRemoveEmotion: (id: number) => void
    onRemoveFactor: (id: number) => void
    onNext: () => void
    onBack: () => void
    explanation: string
    isLoading?: boolean
}

export const ExplanationStep: React.FC<ExplanationStepProps> = ({
    selectedFactors,
    selectedEmotions,
    factors,
    emotions,
    onExplanationChange,
    onRemoveEmotion,
    onRemoveFactor,
    onNext,
    onBack,
    explanation,
    isLoading = false,
}) => {
    const [showNextButton, setShowNextButton] = useState(false)
    const { t } = useTranslation()
    const isKeyboardVisible = useKeyboardStatus()


    const TitleWithHighlights = () => {
        const selectedEmotionsCount = selectedEmotions.length
        const selectedFactorsCount = selectedFactors.length

        return (
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
                <Text className='inline-flex flex-row'>?</Text>
            </View>
        )
    }

    useEffect(() => {
        setShowNextButton(explanation.trim().length > 0)
    }, [explanation])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <Animated.View
                className="flex-1 p-4"
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
                    />
                </View>


                <View className={`pt-4 bg-background dark:bg-background-dark ${isKeyboardVisible ? 'pb-0 px-0' : 'pb-6 px-4'
                    }`}>
                    <Animated.View
                        entering={FadeIn}
                        className="flex-row justify-between align-center"
                    >
                        <View className="flex-row gap-x-2">
                            <Button
                                onPress={onBack}
                                variant="outline"
                                className="px-4"
                            >
                                <Icon
                                    name="ChevronLeft"
                                    size={20}
                                />
                            </Button>

                            <VoiceInputButton
                                onTranscribe={onExplanationChange}
                                asButton
                            />
                        </View>

                        {showNextButton && (
                            <Button
                                onPress={onNext}
                                variant="outline"
                                disabled={isLoading || !showNextButton}
                            >
                                {isLoading ? t('common.loading') : t('common.next')}
                            </Button>
                        )}

                    </Animated.View>
                </View>

            </Animated.View>
        </KeyboardAvoidingView>
    )
}