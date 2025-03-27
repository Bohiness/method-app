import { useTheme } from '@shared/context/theme-provider'
import { useMood } from '@shared/hooks/diary/mood/useMood'
import { Emotion } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import * as Haptics from 'expo-haptics'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

interface EmotionsStepProps {
    emotions: Emotion[]
    selectedEmotions: number[]
    onSelect: (id: number) => void
    moodLevel: number
    onNextStep?: () => void
    onBackStep?: () => void
}

export function EmotionsStep({
    emotions,
    selectedEmotions,
    onSelect,
    moodLevel,
    onNextStep,
    onBackStep
}: EmotionsStepProps) {
    const { moods } = useMood()
    const [selectedMood, setSelectedMood] = useState<number>(moodLevel)
    const [filteredEmotions, setFilteredEmotions] = useState<Emotion[]>([])
    const { t } = useTranslation()
    const { isDark } = useTheme()
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

    return (
        <View className="flex-1 px-4">
            <Title className="mb-6 text-center">
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
                            className={`p-4 rounded-full `}
                            style={selectedMood === mood.level ? animatedIconStyle : undefined}
                        >
                            {mood.icon(selectedMood === mood.level ?
                                (isDark ? '#FFFFFF' : '#374151') :
                                (isDark ? '#9CA3AF' : '#9CA3AF')
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
                                onSelect(emotion.id)
                            }}
                            variant={selectedEmotions.includes(emotion.id) ? "default" : "secondary"}
                        >
                            {emotion.name}
                        </Button>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}