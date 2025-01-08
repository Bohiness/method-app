import { useColorScheme } from '@shared/context/theme-provider'
import { Emotion } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text, Title } from '@shared/ui/styled-text'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import Animated, { FadeIn, SlideInRight, SlideOutLeft, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { moods } from './MoodLevelStep'

interface EmotionsStepProps {
    emotions: Emotion[]
    selectedEmotions: number[]
    onSelect: (id: number) => void
    onNext: () => void
    onBack: () => void
    moodLevel: number
}

export const EmotionsStep: React.FC<EmotionsStepProps> = ({
    emotions,
    selectedEmotions,
    onSelect,
    onNext,
    onBack,
    moodLevel
}) => {
    const [selectedMood, setSelectedMood] = useState<number>(moodLevel)
    const [filteredEmotions, setFilteredEmotions] = useState<Emotion[]>([])
    const [showNextButton, setShowNextButton] = useState(false)
    const { t } = useTranslation()
    const colorScheme = useColorScheme()

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(1.1) }],
    }))

    // Фильтруем эмоции при изменении выбранного настроения
    useEffect(() => {
        console.log('selectedMood', selectedMood)
        const filtered = emotions.filter(emotion => emotion.mood_level === selectedMood)
        setFilteredEmotions(filtered)
    }, [selectedMood, emotions])

    // Обработчик выбора настроения
    const handleMoodPress = (level: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedMood(level)
    }

    // Следим за выбранными эмоциями
    useEffect(() => {
        setShowNextButton(selectedEmotions.length > 0)
    }, [selectedEmotions])

    return (
        <Animated.View
            className="flex-1 p-4"
            entering={SlideInRight}
            exiting={SlideOutLeft}
        >
            <Title weight='medium' className="mb-6 text-center">
                {t('diary.moodcheckin.step2.title')}
            </Title>

            <View className="flex-row justify-between px-4 mb-8">
                {moods.map((mood) => (
                    <Pressable
                        key={mood.level}
                        onPress={() => handleMoodPress(mood.level)}
                        className="items-center"
                    >
                        <Animated.View
                            className={`p-4 rounded-full ${selectedMood === mood.level
                                ? 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                }`}
                            style={selectedMood === mood.level ? animatedIconStyle : undefined}
                        >
                            {mood.icon(selectedMood === mood.level ?
                                (colorScheme === 'dark' ? '#FFFFFF' : '#374151') :
                                (colorScheme === 'dark' ? '#9CA3AF' : '#9CA3AF')
                            )}
                        </Animated.View>
                        <Text className="text-xs">
                            {t(mood.label)}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView
                className="flex-1 mb-20"
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row flex-wrap gap-2 gap-y-4">
                    {filteredEmotions.map((emotion) => (
                        <Button
                            key={emotion.id}
                            onPress={() => {
                                // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                onSelect(emotion.id)
                            }}
                            variant={selectedEmotions.includes(emotion.id) ? "default" : "secondary"}
                        >
                            {emotion.name}
                        </Button>
                    ))}
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-background dark:bg-background-dark">
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

                    {showNextButton && (
                        <Button
                            onPress={onNext}
                            variant="outline"
                            disabled={!showNextButton}
                        >
                            {t('common.next')} ({selectedEmotions.length})
                        </Button>
                    )}
                </Animated.View>
            </View>
        </Animated.View>
    )
}