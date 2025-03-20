import { useTranslation } from 'react-i18next'

import { EveningReflectionType } from '@shared/types/diary/eveningreflection/EveningReflectionType'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'

// Компонент для отображения вечерней рефлексии
interface EveningReflectionCardProps {
    entry: EveningReflectionType
}

export const EveningReflectionCard: React.FC<EveningReflectionCardProps> = ({ entry }) => {
    const { t } = useTranslation()
    return (
        <View variant='paper' className="mb-4 p-4 rounded-lg border-l-4 border-purple-400">
            <View className="flex flex-row items-center mb-2">
                <Text className="text-2xl mr-2">🌙</Text>
                <Text className="text-lg font-medium">{t('diary.beautifuldiary.eveningReflection.title')}</Text>
            </View>

            {entry.positive_aspects && (
                <View className="mb-2">
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.eveningReflection.positiveAspects')}</Text>
                    <Text className="text-sm">{entry.positive_aspects}</Text>
                </View>
            )}

            {entry.improvement_areas && (
                <View className="mb-2">
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.eveningReflection.improvementAreas')}</Text>
                    <Text className="text-sm">{entry.improvement_areas}</Text>
                </View>
            )}

            {entry.lesson_learned && (
                <View>
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.eveningReflection.lessonLearned')}</Text>
                    <Text className="text-sm">{entry.lesson_learned}</Text>
                </View>
            )}

            {entry.additional_thoughts && (
                <View>
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.eveningReflection.additionalThoughts')}</Text>
                    <Text className="text-sm">{entry.additional_thoughts}</Text>
                </View>
            )}
        </View>
    )
}
