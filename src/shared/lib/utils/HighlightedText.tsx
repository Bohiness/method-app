// src/shared/ui/HighlightedText.tsx
import { Text, Title } from '@shared/ui/text'
import * as Haptics from 'expo-haptics'
import { Pressable, View } from 'react-native'

interface HighlightedTextProps {
    text: string
    onRemove: (id: number) => void
    id: number
    canDelete: boolean
    separator?: React.ReactNode
    isLast?: boolean
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
    text,
    onRemove,
    id,
    canDelete,
    separator = ',',
    isLast = false
}) => (
    <View className="inline-flex flex-row items-center">
        <View className="inline-flex flex-row items-center bg-surface-paper dark:bg-surface-paper-dark rounded-lg px-1 mx-1">
            <Title className="text-secondary-dark dark:text-secondary-dark-dark">
                {text}{!isLast && separator}
            </Title>

            {canDelete && (
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        onRemove(id)
                    }}
                    className="ml-1 flex items-center justify-center"
                >
                    <Text className="text-secondary-dark dark:text-secondary-dark-dark">×</Text>
                </Pressable>
            )}
        </View>

    </View>
)