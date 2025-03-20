import { useTranslation } from 'react-i18next'

import { useFactors } from '@shared/hooks/diary/mood/useFactors'
import { StartDayType } from '@shared/types/diary/startday/StartDayType'
import { Badge } from '@shared/ui/badge'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'

// Компонент для отображения записи начала дня
interface StartDayCardProps {
    entry: StartDayType
}

export const StartDayCard: React.FC<StartDayCardProps> = ({ entry }) => {
    const { t } = useTranslation()
    const { getFactorById } = useFactors()

    return (
        <View variant='paper' className="mb-4 p-4 rounded-lg border-l-4 border-green-400">
            <View className="flex flex-row items-center mb-2">
                <Text className="text-2xl mr-2">🌅</Text>
                <Text className="text-lg font-medium">{t('diary.beautifuldiary.startDay.title')}</Text>
            </View>

            {entry.sleep_quality && (
                <View className="mb-2">
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.startDay.sleepQuality')}</Text>
                    <Text className="text-sm">{entry.sleep_quality}/10</Text>
                </View>
            )}

            {entry.plans_for_day && (
                <View className="mb-2">
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.startDay.plansForDay')}</Text>
                    <Text className="text-sm">{entry.plans_for_day}</Text>
                </View>
            )}

            {entry.priority_for_day && entry.priority_for_day.length > 0 && (
                <View>
                    <Text variant='secondary' className="text-sm mb-1">{t('diary.beautifuldiary.startDay.priorities')}</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {entry.priority_for_day.map((priorityId, index) => {
                            const factor = getFactorById(priorityId)
                            return (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                >
                                    {factor ? factor.name : t(`diary.startday.priorities.${priorityId}`)}
                                </Badge>
                            )
                        })}
                    </View>
                </View>
            )}
        </View>
    )
}
