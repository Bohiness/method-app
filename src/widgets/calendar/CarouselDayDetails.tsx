import { FeatureButton } from '@features/components/FeatureButton'
import { FeatureButtonModal } from '@features/components/FeatureButtonModal'
import { useCarouselAnimation } from '@shared/hooks/animations/useCarouselAnimation'
import { MoodCheckin } from '@widgets/diary/mood/MoodCheckin'
import React from 'react'
import { View, ViewStyle } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'

interface DayCardProps {
    date: Date
    formatDateTime: (date: Date, pattern: string) => string
    style: AnimatedStyle<ViewStyle>
}

const DayCard: React.FC<DayCardProps> = ({ date, formatDateTime, style }) => (
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
                        modalContent={<MoodCheckin date={date} />}
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

interface CarouselDayDetailsProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
    formatDateTime: (date: Date, pattern: string) => string
}

const CarouselDayDetails: React.FC<CarouselDayDetailsProps> = ({
    selectedDate,
    onDateChange,
    formatDateTime,
}) => {
    const today = new Date()
    const canSwipeLeft = selectedDate < today

    // Вычисляем соседние даты
    const prevDate = new Date(selectedDate)
    prevDate.setDate(prevDate.getDate() - 1)

    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + 1)

    const handleDateChange = (direction: 'left' | 'right', source: 'swipe' | 'tap' = 'tap') => {
        const newDate = new Date(selectedDate)
        if (direction === 'right') {
            newDate.setDate(newDate.getDate() - 1)
        } else if (direction === 'left' && canSwipeLeft) {
            newDate.setDate(newDate.getDate() + 1)
        }
        onDateChange(newDate)
    }

    const { gestureHandler, currentStyle, prevStyle, nextStyle } = useCarouselAnimation({
        onChangePage: (direction) => handleDateChange(direction, 'swipe'),
        canSwipeLeft,
        canSwipeRight: true,
        selectedTimestamp: selectedDate.getTime(),
        animationConfig: {
            duration: 300,
        },
        scaling: {
            active: 1,
            inactive: 0.8,
        },
        opacity: {
            active: 1,
            inactive: 0.5,
        },
    })

    return (
        <View className="relative">
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View className="h-32">
                    <DayCard
                        date={prevDate}
                        formatDateTime={formatDateTime}
                        style={prevStyle}
                    />
                    <DayCard
                        date={selectedDate}
                        formatDateTime={formatDateTime}
                        style={currentStyle}
                    />
                    {canSwipeLeft && (
                        <DayCard
                            date={nextDate}
                            formatDateTime={formatDateTime}
                            style={nextStyle}
                        />
                    )}
                </Animated.View>
            </PanGestureHandler>
        </View>
    )
}

export default CarouselDayDetails