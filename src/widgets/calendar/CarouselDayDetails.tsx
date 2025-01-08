import { useCarouselAnimation } from '@shared/hooks/animations/useCarouselAnimation'

import { DayCard } from '@features/calendar/DayCard'
import { NextDayCard } from '@features/calendar/NextDayCard'
import React from 'react'
import { View } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'



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

    const isTommorrow = () => {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return selectedDate.getDate() === tomorrow.getDate() &&
            selectedDate.getMonth() === tomorrow.getMonth() &&
            selectedDate.getFullYear() === tomorrow.getFullYear()
    }

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
                    {isTommorrow() ? (
                        <NextDayCard
                            date={selectedDate}
                            formatDateTime={formatDateTime}
                            style={currentStyle}
                        />
                    ) : (
                        <DayCard
                            date={selectedDate}
                            formatDateTime={formatDateTime}
                            style={currentStyle}
                        />
                    )}
                    {canSwipeLeft && (
                        isTommorrow() ? (
                            <NextDayCard
                                date={nextDate}
                                formatDateTime={formatDateTime}
                                style={nextStyle}
                            />
                        ) : (
                            <DayCard
                                date={nextDate}
                                formatDateTime={formatDateTime}
                                style={nextStyle}
                            />
                        )
                    )}
                </Animated.View>
            </PanGestureHandler>
        </View>
    )
}

export default CarouselDayDetails