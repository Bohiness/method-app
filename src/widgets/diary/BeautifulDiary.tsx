import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useEmotions } from '@shared/hooks/diary/mood/useEmotions'
import { useFactors } from '@shared/hooks/diary/mood/useFactors'
import { moodHelpers, useMoodHistory } from '@shared/hooks/diary/mood/useMoodCheckin'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { MoodCheckin } from '@shared/types/diary/mood/MoodType'
import { Badge } from '@shared/ui/badge'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'

// Компонент для отображения отдельной записи с использованием Badge для эмоций и факторов
interface DiaryEntryCardProps {
    entry: MoodCheckin
    emotions: any
    factors: any
    t: (key: string) => string
}

const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({ entry, emotions, factors, t }) => {
    const { formateDataTimeWithTimezoneAndLocale } = useDateTime()

    return (
        <View key={entry.id} className="p-4 my-2 rounded-lg bg-surface-paper dark:bg-surface-paper-dark">
            <Text weight='semibold' className="mb-1">
                {t('diary.history.moodLevel')}: {entry.mood_level}
            </Text>

            {entry.emotions.length > 0 && (
                <View className="mb-1">
                    <Text weight='semibold' className="mb-2">
                        {t('diary.history.emotions')}:
                    </Text>
                    <View className="flex flex-wrap gap-2">
                        {entry.emotions.map(id => {
                            const emotionName = moodHelpers.getEmotionName(emotions, id)
                            if (!emotionName) return null
                            return (
                                <Badge
                                    key={`emotion-${id}`}
                                    variant='outline'
                                    size='sm'
                                >
                                    {emotionName}
                                </Badge>
                            )
                        })}
                    </View>
                </View>
            )}

            {entry.factors.length > 0 && (
                <View className="mb-1">
                    <Text weight='semibold' className="mb-2">
                        {t('diary.history.factors')}:
                    </Text>
                    <View className="flex flex-wrap gap-2">
                        {entry.factors.map(id => {
                            const factorName = moodHelpers.getFactorName(factors, id)
                            if (!factorName) return null
                            return (
                                <Badge
                                    key={`factor-${id}`}
                                    variant='outline'
                                    size='sm'
                                >
                                    {factorName}
                                </Badge>
                            )
                        })}
                    </View>
                </View>
            )}

            {entry.factor_review_notes && (
                <View className="mb-1">
                    <Text className="font-semibold">
                        {t('diary.history.factorNotes')}:{' '}
                    </Text>
                    <Text>{entry.factor_review_notes}</Text>
                </View>
            )}

            {entry.factor_emotion_review_notes && (
                <View className="mb-1">
                    <Text variant='secondary' size='sm'>
                        {t('diary.history.emotionNotes')}:{' '}
                    </Text>
                    <Text>{entry.factor_emotion_review_notes}</Text>
                </View>
            )}

            <Text variant='secondary' size='sm' className="mt-2">
                {formateDataTimeWithTimezoneAndLocale(entry.created_at, 'HH:mm')}
            </Text>
        </View>
    )
}

// Основной компонент для отображения записей за последнюю неделю с добавлением прокрутки
export function BeautifulDiary() {
    const { t } = useTranslation()
    const { data: moodCheckins, isPending, error } = useMoodHistory()
    const { data: emotions } = useEmotions()
    const { factors } = useFactors()
    const { formateDataTimeWithTimezoneAndLocale } = useDateTime()

    const lastWeekEntries = useMemo(() => {
        if (!moodCheckins || !Array.isArray(moodCheckins)) return {}

        const now = new Date()
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)

        const filtered = moodCheckins.filter(
            entry => new Date(entry.created_at) >= weekAgo
        )

        return filtered.reduce((acc, entry) => {
            const day = formateDataTimeWithTimezoneAndLocale(entry.created_at, 'dd MMMM')
            if (!acc[day]) acc[day] = []
            acc[day].push(entry)
            return acc
        }, {} as Record<string, MoodCheckin[]>)

    }, [moodCheckins])

    if (isPending) {
        return (
            <View className="p-4">
                <Text>{t('common.loading')}</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View className="p-4">
                <Text>{t('common.error')}</Text>
            </View>
        )
    }

    return (
        <View className="p-4 bg-gray-200 min-h-[800px] overflow-y-scroll">

            {Object.entries(lastWeekEntries).map(([date, entries]) => (
                <View key={date} className="mb-6">
                    <Text className="text-xl font-semibold mb-2">{date}</Text>
                    {entries.map(entry => (
                        <DiaryEntryCard
                            key={entry.id}
                            entry={entry}
                            emotions={emotions}
                            factors={factors}
                            t={t}
                        />
                    ))}
                </View>
            ))}

            {Object.keys(lastWeekEntries).length === 0 && (
                <Text className="text-center text-gray-500">
                    {t('diary.history.noEntries')}
                </Text>
            )}
        </View>
    )
} 