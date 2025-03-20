import { useDiary } from '@shared/hooks/diary/useDiary'
import { MoodCheckin } from '@shared/types/diary/mood/MoodType'
import { Badge } from '@shared/ui/badge'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'

// Компонент для отображения записи настроения
interface MoodEntryCardProps {
    entry: MoodCheckin
    emotions: any
    factors: any
}

export const MoodEntryCard: React.FC<MoodEntryCardProps> = ({ entry, emotions, factors }) => {
    const { t } = useTranslation()
    const { diaryHelpers } = useDiary()
    const moodEmoji = diaryHelpers.getMoodEmoji(entry.mood_level)
    const emotionNames = diaryHelpers.getEmotionNames(entry.emotions, emotions)
    const factorNames = diaryHelpers.getFactorNames(entry.factors, factors)

    return (
        <View variant='paper' className="mb-4 p-4 rounded-lg border-l-4 border-blue-400">
            <View className="flex flex-row items-center mb-2">
                <Text className="text-2xl mr-2">{moodEmoji}</Text>
                <Text className="text-lg font-medium">{diaryHelpers.getMoodDescription(entry.mood_level, t)}</Text>
            </View>

            {emotionNames.length > 0 && (
                <View className="mb-2">
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.emotions')}</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {emotionNames.map((emotion: string, index: number) => (
                            <Badge
                                key={index}
                                variant="outline"
                                size="sm"
                            >
                                {emotion}
                            </Badge>
                        ))}
                    </View>
                </View>
            )}

            {factorNames.length > 0 && (
                <View className="mb-2">
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.factors')}</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {factorNames.map((factor: string, index: number) => (
                            <Badge
                                key={index}
                                variant="outline"
                                size="sm"
                            >
                                {factor}
                            </Badge>
                        ))}
                    </View>
                </View>
            )}

            {entry.factor_review_notes && (
                <View className="mb-2">
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.factorNote')}</Text>
                    <Text className="text-sm">{entry.factor_review_notes}</Text>
                </View>
            )}

            {entry.factor_emotion_review_notes && (
                <View>
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.emotionNote')}</Text>
                    <Text className="text-sm">{entry.factor_emotion_review_notes}</Text>
                </View>
            )}
        </View>
    )
}
