import { useTheme } from '@react-navigation/native'
import { cn } from '@shared/lib/utils/cn'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated'
import { Text } from './text'
import { View } from './view'

interface TimePickerProps {
    initialDate: Date
    onChange: (date: Date) => void
    format?: '12h' | '24h'
    className?: string
    backgroundVariant?: 'default' | 'paper' | 'canvas' | 'stone' | 'inverse' | 'transparent'
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

const generateTimeArray = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => {
        const num = i + start
        return num < 10 ? `0${num}` : `${num}`
    })
}

const ITEM_HEIGHT = 64
const VISIBLE_ITEMS = 1.3
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS
const SCROLL_PADDING = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2 + 4


export const OpenTimePicker: React.FC<TimePickerProps> = ({
    initialDate = new Date(new Date().setHours(9, 0, 0, 0)),
    onChange,
    format = '24h',
    className,
    backgroundVariant = 'paper'
}) => {
    const { colors } = useTheme()

    const [isReady, setIsReady] = useState(false)
    const [isInitialScroll, setIsInitialScroll] = useState(true)

    const hourScrollRef = useRef<ScrollView>(null)
    const minuteScrollRef = useRef<ScrollView>(null)

    const hourScrollY = useSharedValue(initialDate.getHours() * ITEM_HEIGHT)
    const minuteScrollY = useSharedValue(initialDate.getMinutes() * ITEM_HEIGHT)

    const [currentHour, setCurrentHour] = useState(initialDate.getHours())
    const [currentMinute, setCurrentMinute] = useState(initialDate.getMinutes())

    const hours = generateTimeArray(0, format === '24h' ? 23 : 12)
    const minutes = generateTimeArray(0, 59)

    const updateTime = useCallback((type: 'hour' | 'minute', value: number) => {
        const newDate = new Date(initialDate)

        if (type === 'hour') {
            setCurrentHour(value)
            newDate.setHours(value)
            newDate.setMinutes(currentMinute)
        } else {
            setCurrentMinute(value)
            newDate.setHours(currentHour)
            newDate.setMinutes(value)
        }

        onChange(newDate)
    }, [currentHour, currentMinute, onChange, initialDate])

    const scrollHandler = (type: 'hour' | 'minute') => useAnimatedScrollHandler({
        onScroll: (event) => {
            if (type === 'hour') {
                hourScrollY.value = event.contentOffset.y
            } else {
                minuteScrollY.value = event.contentOffset.y
            }
        },
        onMomentumEnd: (event) => {
            const offsetY = event.contentOffset.y
            const itemIndex = Math.round(offsetY / ITEM_HEIGHT)
            const snapToValue = itemIndex * ITEM_HEIGHT

            if (type === 'hour') {
                hourScrollY.value = withSpring(snapToValue)
                runOnJS(updateTime)('hour', itemIndex)
            } else {
                minuteScrollY.value = withSpring(snapToValue)
                runOnJS(updateTime)('minute', itemIndex)
            }
        }
    })

    const getAnimatedStyle = (scrollValue: Animated.SharedValue<number>) => useAnimatedStyle(() => {
        const currentIndex = Math.round(scrollValue.value / ITEM_HEIGHT)
        const inputRange = [
            (currentIndex - 1) * ITEM_HEIGHT,
            currentIndex * ITEM_HEIGHT,
            (currentIndex + 1) * ITEM_HEIGHT
        ]

        const scale = interpolate(
            scrollValue.value,
            inputRange,
            [0.8, 1, 0.8],
            'clamp'
        )

        const opacity = interpolate(
            scrollValue.value,
            inputRange,
            [0.3, 1, 0.3],
            'clamp'
        )

        return {
            transform: [{ scale }],
            opacity
        }
    })

    const handleLayout = () => {
        if (!isReady) {
            setIsReady(true)
        }
    }

    const scrollViewContentStyle = useMemo(() => ({ paddingVertical: SCROLL_PADDING }), [])

    return (
        <View variant='transparent' className={cn("relative", className)}>
            <View
                variant={backgroundVariant}
                style={{ height: CONTAINER_HEIGHT }}
                className="flex-row justify-center items-center overflow-hidden rounded-2xl"
            >
                {/* Часы */}
                <View variant='transparent' className="flex-1 h-full">
                    <AnimatedScrollView
                        ref={hourScrollRef}
                        onLayout={handleLayout}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onScroll={scrollHandler('hour')}
                        scrollEventThrottle={16}
                        contentContainerStyle={scrollViewContentStyle}
                        contentOffset={{ x: 0, y: currentHour * ITEM_HEIGHT }}
                        pagingEnabled={false}
                        overScrollMode="never"
                        bounces={true}
                    >
                        {hours.map((hour) => (
                            <Animated.View
                                key={hour}
                                style={[
                                    {
                                        height: ITEM_HEIGHT,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    },
                                    getAnimatedStyle(hourScrollY)
                                ]}
                            >
                                <Text className="text-6xl font-light">{hour}</Text>
                            </Animated.View>
                        ))}
                    </AnimatedScrollView>
                </View>

                <Text className="text-6xl px-4 font-light">:</Text>

                {/* Минуты */}
                <View variant='transparent' className="flex-1 h-full">
                    <AnimatedScrollView
                        ref={minuteScrollRef}
                        onLayout={handleLayout}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onScroll={scrollHandler('minute')}
                        scrollEventThrottle={16}
                        contentContainerStyle={scrollViewContentStyle}
                        contentOffset={{ x: 0, y: currentMinute * ITEM_HEIGHT }}
                        pagingEnabled={false}
                        overScrollMode="never"
                        bounces={true}
                    >
                        {minutes.map((minute) => (
                            <Animated.View
                                key={minute}
                                style={[
                                    {
                                        height: ITEM_HEIGHT,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    },
                                    getAnimatedStyle(minuteScrollY)
                                ]}
                            >
                                <Text className="text-6xl font-light">{minute}</Text>
                            </Animated.View>
                        ))}
                    </AnimatedScrollView>
                </View>
            </View>

        </View>
    )
}