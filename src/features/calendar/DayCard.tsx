// DayCard.tsx

import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { MoodCheckin } from '@widgets/diary/mood/MoodCheckin'
import { router } from 'expo-router'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, ViewStyle } from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'

interface DayCardProps {
    date: Date
    isTomorrow: boolean
    style: AnimatedStyle<ViewStyle>
}

export const DayCard: React.FC<DayCardProps> = React.memo(({ date, isTomorrow, style }) => {
    const { t } = useTranslation()

    // Используем useMemo для стабильной даты в рендеринге
    const dateString = useMemo(() => date.toISOString(), [date])

    console.log('DayCard rendered', dateString)

    // Мемоизируем содержимое карточки для предотвращения лишних ререндеров
    const cardContent = useMemo(() => {
        if (!isTomorrow) {
            return (
                <>
                    <View className="flex-1">
                        <FeatureButtonModal
                            title="diary.moodCheckin.title"
                            description="diary.moodCheckin.description"
                            icon="Rabbit"
                            onPress={() => router.push('/(modals)/(diary)/mood')}
                        />
                    </View>

                    <View className="flex-row justify-between gap-4">
                        <View className="flex-1 flex-grow">
                            <FeatureButtonModal
                                title="diary.startYourDay.title"
                                description="diary.startYourDay.description"
                                icon="Sun"
                                onPress={() => router.push('/(modals)/(diary)/start-your-day')}
                            />
                        </View>

                        <View className="flex-1 flex-grow">
                            <FeatureButtonModal
                                title="diary.mood.eveningReflection"
                                description="diary.mood.sumUpYourDay"
                                icon="Moon"
                                onPress={() => router.push('/(modals)/(diary)/evening-reflection')}
                            />
                        </View>
                    </View>
                </>
            )
        } else {
            return (
                <View className="flex-col gap-4">
                    <View className="flex-1">
                        <FeatureButtonModal
                            title={t('plans.nextDayPlan.title')}
                            description={t('plans.nextDayPlan.description')}
                            icon="NotebookPen"
                            modalContent={<MoodCheckin date={date} />}
                        />
                    </View>
                </View>
            )
        }
    }, [isTomorrow, date, t])

    return (
        <Animated.View
            style={[style]}
            className="absolute w-full rounded-3xl bg-background dark:bg-background-dark"
        >
            <View className="flex-col gap-4">
                {cardContent}
            </View>
        </Animated.View>
    )
}, (prevProps, nextProps) => {
    // Дополнительная проверка равенства для предотвращения лишних ререндеров
    return prevProps.isTomorrow === nextProps.isTomorrow &&
        prevProps.date.getTime() === nextProps.date.getTime() &&
        prevProps.style === nextProps.style
})