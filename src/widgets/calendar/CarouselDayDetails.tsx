import { useCarouselAnimation } from '@shared/hooks/animations/useCarouselAnimation'
import { Text } from '@shared/ui/styled-text'
import { EveningReflectionButton } from '@widgets/diary/mood/EveningReflectionButton'
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
        className="absolute w-full rounded-3xl bg-light-background dark:bg-dark-background"
    >
        <View className="p-4">
            <View className="flex-row justify-between">
                <View>
                    <Text className="text-lg font-bold">{formatDateTime(date, 'dd')}</Text>
                    <Text className="text-sm text-gray-500">{formatDateTime(date, 'EEE')}</Text>
                </View>
                <EveningReflectionButton date={date} />
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

    // Изменяем эту функцию, добавляя проверку источника изменения
    const handleDateChange = (direction: 'left' | 'right', source: 'swipe' | 'tap' = 'tap') => {
        // Если источник - свайп, просто вызываем onDateChange
        if (source === 'swipe') {
            const newDate = new Date(selectedDate)
            if (direction === 'right') {
                newDate.setDate(newDate.getDate() - 1)
            } else if (direction === 'left' && canSwipeLeft) {
                newDate.setDate(newDate.getDate() + 1)
            }
            onDateChange(newDate)
            return
        }

        // Для нажатия оставляем старую логику
        const newDate = new Date(selectedDate)
        if (direction === 'right') {
            newDate.setDate(newDate.getDate() - 1)
        } else if (direction === 'left' && canSwipeLeft) {
            newDate.setDate(newDate.getDate() + 1)
        }
        onDateChange(newDate)
    }

    const { gestureHandler, currentStyle, prevStyle, nextStyle } = useCarouselAnimation({
        onChangePage: (direction) => handleDateChange(direction, 'swipe'), // Указываем источник
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
        <View>
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