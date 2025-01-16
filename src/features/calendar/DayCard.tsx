import { FeatureButton } from '@features/components/FeatureButton'
import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { MoodCheckin } from '@widgets/diary/mood/MoodCheckin'
import React from 'react'

import { View, ViewStyle } from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'

interface DayCardProps {
    date: Date
    formatDateTime: (date: Date, pattern: string) => string
    style: AnimatedStyle<ViewStyle>
}

export const DayCard: React.FC<DayCardProps> = ({ date, formatDateTime, style }) => (
    <Animated.View
        style={[style]}
        className="absolute w-full rounded-3xl bg-background dark:bg-background-dark"
    >
        <View className="flex-col gap-4">
            <View className="flex-1">
                <FeatureButtonModal
                    title="diary.moodCheckin.title"
                    description="diary.moodCheckin.description"
                    icon="Rabbit"
                    modalContent={<MoodCheckin date={date} />}
                />
            </View>

            <View className="flex-row justify-between gap-4">
                <View className="flex-1 flex-grow">
                    <FeatureButton
                        className="flex-1"
                        title="diary.startYourDay.title"
                        description="diary.startYourDay.description"
                        icon="Sun"
                    />
                </View>

                <View className="flex-1 flex-grow">
                    <FeatureButton
                        className="flex-1"
                        title="diary.mood.eveningReflection"
                        description="diary.mood.sumUpYourDay"
                        icon="Moon"
                    />
                </View>
            </View>
        </View>
    </Animated.View>
)