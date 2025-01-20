// CarouselDayDetails.tsx

import { DayCard } from '@features/calendar/DayCard'
import { NextDayCard } from '@features/calendar/NextDayCard'
import { useCarouselAnimation } from '@shared/hooks/animations/useCarouselAnimation'
import React from 'react'
import { View } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

interface CarouselDayDetailsProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
    formatDateTime: (date: Date, pattern: string) => string
}

const CarouselDayDetails: React.FC<CarouselDayDetailsProps> = React.memo(({
    selectedDate,
    onDateChange,
    formatDateTime,
}) => {
    const today = new Date()
    const canSwipeLeft = selectedDate < today

    const prevDate = new Date(selectedDate)
    prevDate.setDate(prevDate.getDate() - 1)

    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + 1)

    const isTomorrow = (date?: Date) => {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const result =
            date?.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
        console.log('isTomorrow check:', result)
        return result
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
        onChangePage: (direction) => {
            console.log('onChangePage called with direction:', direction)
            handleDateChange(direction, 'swipe')
        },
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
        <View style={{ position: 'relative' }}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View>
                    <DayCard
                        date={prevDate}
                        formatDateTime={formatDateTime}
                        style={prevStyle}
                    />
                    {isTomorrow(selectedDate) ? (
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
                        isTomorrow(nextDate) ? (
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
}, (prevProps, nextProps) => {
    return prevProps.selectedDate.getTime() === nextProps.selectedDate.getTime() &&
        prevProps.onDateChange === nextProps.onDateChange &&
        prevProps.formatDateTime === nextProps.formatDateTime
})

export default CarouselDayDetails