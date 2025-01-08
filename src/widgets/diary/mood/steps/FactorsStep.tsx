import { HighlightedText } from '@shared/lib/utils/HighlightedText'
import { Emotion, Factor } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, ScrollView, TouchableWithoutFeedback, View } from 'react-native'
import Animated, {
    FadeIn,
    SlideInRight,
    SlideOutLeft
} from 'react-native-reanimated'

// FactorsStep
interface FactorsStepProps {
    factors: Factor[]
    selectedFactors: number[]
    selectedEmotions: number[]
    onSelect: (id: number) => void
    onNotesChange: (text: string) => void
    onNext: () => void
    onBack: () => void
    emotions: Emotion[]
    onRemoveEmotion: (id: number) => void
}

export const FactorsStep: React.FC<FactorsStepProps> = ({
    factors,
    selectedFactors,
    selectedEmotions,
    onSelect,
    onNotesChange,
    onNext,
    onBack,
    emotions,
    onRemoveEmotion
}) => {
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
                className="flex-1 p-4"
                entering={SlideInRight}
                exiting={SlideOutLeft}
            >
                <TitleWithHighlights />

                <TextInput
                    placeholder={t('diary.moodcheckin.step4.placeholder')}
                    multiline
                    numberOfLines={3}
                    onChangeText={onNotesChange}
                    className='mb-6'
                />

                <ScrollView
                    className="flex-1 mb-20"
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

                <View className="px-4 pb-6 pt-4 bg-background dark:bg-background-dark">
                    <Animated.View
                        entering={FadeIn}
                        className="flex-row justify-between align-center"
                    >
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

                        <Button
                            onPress={onNext}
                            variant="outline"
                        >
                            {t('common.next')} ({selectedFactors.length})
                        </Button>
                    </Animated.View>
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}