import { Factor } from '@shared/types/diary/mood/MoodType'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/styled-text'
import * as Haptics from 'expo-haptics'
import { Animated, ScrollView, TextInput, View } from 'react-native'
import { SlideInRight, SlideOutLeft } from 'react-native-reanimated'

// FactorsStep
interface FactorsStepProps {
    factors: Factor[]
    selectedFactors: number[]
    onSelect: (id: number) => void
    onNotesChange: (text: string) => void
    onComplete: () => void
    onBack: () => void
    isLoading: boolean
}

export const FactorsStep: React.FC<FactorsStepProps> = ({
    factors,
    selectedFactors,
    onSelect,
    onNotesChange,
    onComplete,
    onBack,
    isLoading,
}) => {
    return (
        <Animated.View
            className="flex-1 p-4"
            entering={SlideInRight}
            exiting={SlideOutLeft}
        >
            <Text className="mb-6 text-center text-xl">
                Что повлияло на ваше состояние?
            </Text>

            <TextInput
                className="mb-4 rounded-xl border border-gray-200 p-3"
                placeholder="Добавьте заметку..."
                multiline
                numberOfLines={3}
                onChangeText={onNotesChange}
            />

            <ScrollView className="flex-1">
                <View className="flex-row flex-wrap gap-3">
                    {factors.map((factor) => (
                        <Button
                            key={factor.id}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                onSelect(factor.id)
                            }}
                            variant={selectedFactors.includes(factor.id) ? "tint" : "outline"}
                            className="mb-3"
                        >
                            {factor.name}
                        </Button>
                    ))}
                </View>
            </ScrollView>

            <View className="flex-row justify-between space-x-4">
                <Button onPress={onBack} variant="outline" className="flex-1">
                    Назад
                </Button>
                <Button
                    onPress={onComplete}
                    variant="tint"
                    className="flex-1"
                    disabled={isLoading}
                >
                    {isLoading ? 'Сохранение...' : 'Завершить'}
                </Button>
            </View>
        </Animated.View>
    )
}