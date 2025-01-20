import { Title } from '@shared/ui/text'
import React from 'react'
import { Pressable } from 'react-native'
import Animated, {
    Layout
} from 'react-native-reanimated'

interface TabButtonProps {
    title: string
    isActive: boolean
    onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)


export const TabButton = ({ title, isActive, onPress }: TabButtonProps) => {

    return (
        <AnimatedPressable
            onPress={onPress}
            layout={Layout}
            className={`py-2 ${isActive ? 'border-b-2 border-text dark:border-text-dark' : ''}`}
        >
            <Title
                weight={isActive ? 'semibold' : 'normal'}
                className={isActive ? 'text-text dark:text-text-dark' : 'text-secondary-light dark:text-secondary-light-dark'}
            >
                {title}
            </Title>
        </AnimatedPressable>
    )
}
