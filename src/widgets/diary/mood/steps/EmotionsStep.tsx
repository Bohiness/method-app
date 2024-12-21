import { Emotion } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/styled-text'
import * as Haptics from 'expo-haptics'
import { Animated, ScrollView, View } from 'react-native'
import { SlideInRight, SlideOutLeft } from 'react-native-reanimated'

// EmotionsStep
interface EmotionsStepProps {
    emotions: Emotion[]
    selectedEmotions: number[]
    onSelect: (id: number) => void
    onNext: () => void
    onBack: () => void
}

export const EmotionsStep: React.FC<EmotionsStepProps> = ({
    emotions,
    selectedEmotions,
    onSelect,
    onNext,
    onBack,
}) => {
    return (
        <Animated.View
            className="flex-1 p-4"
            entering={SlideInRight}
            exiting={SlideOutLeft}
        >
            <Text className="mb-6 text-center text-xl">
                Какие эмоции вы испытываете?
            </Text>

            <ScrollView className="flex-1">
                <View className="flex-row flex-wrap gap-3">
                    {emotions.map((emotion) => (
                        <Button
                            key={emotion.id}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                onSelect(emotion.id)
                            }}
                            variant={selectedEmotions.includes(emotion.id) ? "tint" : "outline"}
                            className="mb-3"
                        >
                            {emotion.name}
                        </Button>
                    ))}
                </View>
            </ScrollView>

            <View className="flex-row justify-between space-x-4">
                <Button onPress={onBack} variant="outline" className="flex-1">
                    Назад
                </Button>
                <Button onPress={onNext} variant="tint" className="flex-1">
                    Далее
                </Button>
            </View>
        </Animated.View>
    )
}
