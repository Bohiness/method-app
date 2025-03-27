import React from 'react'
import { useTranslation } from 'react-i18next'

import { useEmotions } from '@shared/hooks/diary/mood/useEmotions'
import { useFactors } from '@shared/hooks/diary/mood/useFactors'
import { EveningReflectionType } from '@shared/types/diary/eveningreflection/EveningReflectionType'
import { MoodCheckin } from '@shared/types/diary/mood/MoodType'
import { StartDayType } from '@shared/types/diary/startday/StartDayType'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'

import { EveningReflectionCard } from '@entities/diary/beautifulDiary/EveningReflectionCard'
import { JournalCard } from '@entities/diary/beautifulDiary/JournalCard'
import { MoodEntryCard } from '@entities/diary/beautifulDiary/MoodEntryCard'
import { StartDayCard } from '@entities/diary/beautifulDiary/StartDayCard'
import { APP_ROUTES } from '@shared/constants/system/app-routes'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Journal } from '@shared/types/diary/journal/JournalTypes'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert'
import {
    CardSkeleton,
    TextSkeleton
} from '@shared/ui/skeleton'
import { router } from 'expo-router'
import { FlatList, ScrollView } from 'react-native'
import { DiaryEntry, useDiary } from '../../shared/hooks/diary/useDiary'
// Компонент для отображения диаграммы записи с информацией о типе
interface UniversalDiaryEntryProps {
    diaryEntry: DiaryEntry
    emotions: any
    factors: any
    t: (key: string) => string
}

const UniversalDiaryEntry: React.FC<UniversalDiaryEntryProps> = ({ diaryEntry, emotions, factors, t }) => {
    const { formatDateTimeWithTimezoneAndLocale } = useDateTime()

    // Форматирование времени создания
    const timeFormatted = formatDateTimeWithTimezoneAndLocale(diaryEntry.created_at, 'HH:mm')

    // Отображение в зависимости от типа записи
    const renderEntry = () => {
        switch (diaryEntry.type) {
            case 'mood':
                return (
                    <MoodEntryCard
                        entry={diaryEntry.data as MoodCheckin}
                        emotions={emotions}
                        factors={factors}
                    />
                )
            case 'startDay':
                return (
                    <StartDayCard
                        entry={diaryEntry.data as StartDayType}
                    />
                )
            case 'eveningReflection':
                return (
                    <EveningReflectionCard
                        entry={diaryEntry.data as EveningReflectionType}
                    />
                )

            case 'journal':
                return (
                    <JournalCard
                        entry={diaryEntry.data as Journal}
                        onPress={() => {
                            router.push({
                                pathname: `/${APP_ROUTES.MODALS.DIARY.JOURNAL.ENTRY}`,
                                params: { journalId: diaryEntry.id }
                            })
                        }}
                    />
                )
            default:
                return <Text>{t('diary.beautifuldiary.unknownEntry')}</Text>
        }
    }

    return (
        <View className="mb-4">
            <Text variant='secondary' className="text-sm mb-1">{timeFormatted}</Text>
            {renderEntry()}
        </View>
    )
}

// Основной компонент для отображения записей за последнюю неделю с добавлением прокрутки
export function BeautifulDiary() {
    const { t } = useTranslation()
    const { data: emotions } = useEmotions()
    const { factors } = useFactors()
    const { entriesByDay, isPending, error } = useDiary()
    const { formatDateTimeWithTimezoneAndLocale } = useDateTime()

    if (isPending) {
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* Скелетон для первого дня */}
                <View className="mb-6">
                    <TextSkeleton size="lg" width="40%" className="mb-2" />

                    {/* Несколько карточек записей */}
                    <View className="mb-4">
                        <TextSkeleton size="sm" width="15%" className="mb-1" />
                        <CardSkeleton height={120} className="rounded-xl" />
                    </View>

                    <View className="mb-4">
                        <TextSkeleton size="sm" width="15%" className="mb-1" />
                        <CardSkeleton height={150} className="rounded-xl" />
                    </View>
                </View>

                {/* Скелетон для второго дня */}
                <View className="mb-6">
                    <TextSkeleton size="lg" width="35%" className="mb-2" />

                    {/* Несколько карточек записей */}
                    <View className="mb-4">
                        <TextSkeleton size="sm" width="15%" className="mb-1" />
                        <CardSkeleton height={130} className="rounded-xl" />
                    </View>

                    <View className="mb-4">
                        <TextSkeleton size="sm" width="15%" className="mb-1" />
                        <CardSkeleton height={100} className="rounded-xl" />
                    </View>

                    <View className="mb-4">
                        <TextSkeleton size="sm" width="15%" className="mb-1" />
                        <CardSkeleton height={140} className="rounded-xl" />
                    </View>
                </View>
            </ScrollView>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" >
                <AlertTitle>{t('common.error')}</AlertTitle>
                <AlertDescription>{t('common.errorDescription')}</AlertDescription>
            </Alert>
        )
    }

    // Преобразуем объект entriesByDay в массив для FlatList
    const sections = Object.entries(entriesByDay).map(([date, entries]) => ({
        date,
        data: entries, // FlatList ожидает поле 'data' для SectionList, но мы используем FlatList, поэтому назовем его 'entries' для ясности в renderItem
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Сортируем дни по убыванию

    // Функция для рендеринга одного дня (секции)
    const renderDaySection = ({ item }: { item: { date: string; data: DiaryEntry[] } }) => {
        return (
            <View className="mb-6">
                <Text className="text-xl font-semibold mb-2 capitalize">{item.date}</Text>
                {item.data.map(entry => (
                    <UniversalDiaryEntry
                        key={entry.id}
                        diaryEntry={entry}
                        emotions={emotions}
                        factors={factors}
                        t={t}
                    />
                ))}
            </View>
        )
    }

    // Компонент для отображения, когда список пуст
    const renderEmptyList = () => (
        <View className="flex-1 justify-center items-center mt-10">
            <Text align='center' variant='secondary'>
                {t('diary.history.noEntries')}
            </Text>
        </View>
    )

    return (
        <FlatList
            data={sections} // Передаем подготовленный массив секций
            renderItem={renderDaySection} // Используем функцию рендеринга секции дня
            keyExtractor={(item) => item.date} // Используем дату как уникальный ключ для секции
            ListEmptyComponent={renderEmptyList} // Компонент для пустого списка
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }} // Добавляем отступ снизу и разрешаем контейнеру расти
            showsVerticalScrollIndicator={false} // Скрываем индикатор прокрутки для чистоты
        />
    )
} 