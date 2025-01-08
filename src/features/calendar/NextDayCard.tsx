import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { MoodCheckin } from '@widgets/diary/mood/MoodCheckin'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { View, ViewStyle } from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'

interface NextDayCardProps {
    date: Date
    formatDateTime: (date: Date, pattern: string) => string
    style: AnimatedStyle<ViewStyle>
}

export const NextDayCard: React.FC<NextDayCardProps> = ({ date, formatDateTime, style }) => {
    const { t } = useTranslation()

    return (
        <Animated.View
            style={[style]}
            className="absolute w-full rounded-3xl bg-background dark:bg-background-dark"
        >
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
        </Animated.View>
    )
}