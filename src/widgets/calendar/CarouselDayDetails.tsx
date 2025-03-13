// CarouselDayDetails.tsx

import { DayCard } from '@features/calendar/DayCard'
import { useCarouselAnimation } from '@shared/hooks/animations/useCarouselAnimation'
import React, { useCallback, useMemo } from 'react'
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
}) => {
    const today = useMemo(() => new Date(), [])
    const canSwipeLeft = useMemo(() => selectedDate < today, [selectedDate, today])

    const prevDate = useMemo(() => {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() - 1)
        return date
    }, [selectedDate])

    const nextDate = useMemo(() => {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() + 1)
        return date
    }, [selectedDate])

    const isTomorrow = useCallback((date?: Date) => {
        if (!date) return false
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
    }, [])

    const handleDateChange = useCallback((direction: 'left' | 'right') => {
        const newDate = new Date(selectedDate)
        if (direction === 'right') {
            newDate.setDate(newDate.getDate() - 1)
        } else if (direction === 'left' && canSwipeLeft) {
            newDate.setDate(newDate.getDate() + 1)
        }
        onDateChange(newDate)
    }, [selectedDate, canSwipeLeft, onDateChange])

    const selectedTimestamp = useMemo(() => selectedDate.getTime(), [selectedDate])

    const { gestureHandler, currentStyle, prevStyle, nextStyle } = useCarouselAnimation({
        onChangePage: handleDateChange,
        canSwipeLeft,
        canSwipeRight: true,
        selectedTimestamp,
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

    const prevCardMemo = useMemo(() => (
        <DayCard
            key={`prev-${prevDate.toISOString()}`}
            date={prevDate}
            isTomorrow={isTomorrow(prevDate)}
            style={prevStyle}
        />
    ), [prevDate, isTomorrow, prevStyle])

    const currentCardMemo = useMemo(() => (
        <DayCard
            key={`current-${selectedDate.toISOString()}`}
            date={selectedDate}
            isTomorrow={isTomorrow(selectedDate)}
            style={currentStyle}
        />
    ), [selectedDate, isTomorrow, currentStyle])

    const nextCardMemo = useMemo(() => canSwipeLeft ? (
        <DayCard
            key={`next-${nextDate.toISOString()}`}
            date={nextDate}
            isTomorrow={isTomorrow(nextDate)}
            style={nextStyle}
        />
    ) : null, [canSwipeLeft, nextDate, isTomorrow, nextStyle])

    return (
        <Animated.View style={{ position: 'relative' }}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={{ width: '100%' }}>
                    {prevCardMemo}
                    {currentCardMemo}
                    {nextCardMemo}
                </Animated.View>
            </PanGestureHandler>
        </Animated.View>
    )
})

export default CarouselDayDetails
