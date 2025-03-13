import LottieView from 'lottie-react-native'
import React from 'react'
import { View, useWindowDimensions } from 'react-native'

interface GlowingEdgeProps {
    audioLevel: number
    position: 'left' | 'right' | 'top' | 'bottom'
    color: string
    isVisible: boolean
}

export const GlowingEdge = ({
    audioLevel,
    position,
    isVisible,
}: GlowingEdgeProps) => {
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions()
    const lottieAnim = require('@assets/animations-lottie/Glowing/Animation-1737469312702.lottie')
    const EDGE_SIZE = 400

    const getTransform = () => {
        switch (position) {
            case 'left':
                return [{ rotate: '270deg' }]
            case 'right':
                return [{ rotate: '90deg' }]
            case 'top':
                return [{ rotate: '0deg' }]
            case 'bottom':
                return [{ rotate: '180deg' }]
        }
    }

    if (!isVisible) return null

    return (
        <View
            style={{
                position: 'absolute',
                ...(position === 'left' && { left: 0, top: SCREEN_HEIGHT / 2 }),
                ...(position === 'right' && { right: 0, top: SCREEN_HEIGHT / 2 }),
                ...(position === 'top' && { top: 0, left: SCREEN_WIDTH / 2 }),
                ...(position === 'bottom' && { bottom: 0, left: SCREEN_WIDTH / 2 }),
            }}
        >
            <LottieView
                source={lottieAnim}
                autoPlay
                loop
                speed={audioLevel}
                style={{
                    width: position === 'left' || position === 'right' ? EDGE_SIZE : SCREEN_WIDTH,
                    height: position === 'top' || position === 'bottom' ? EDGE_SIZE : SCREEN_HEIGHT,
                    transform: getTransform(),
                }}
            />
        </View>
    )
}