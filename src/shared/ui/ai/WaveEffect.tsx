import LottieView from 'lottie-react-native'
import React from 'react'
import { useWindowDimensions, View } from 'react-native'

interface WaveEffectProps {
    audioLevel: number
    isVisible: boolean
}

export const WaveEffect = ({
    audioLevel,
    isVisible,
}: WaveEffectProps) => {
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions()
    const EDGE_SIZE = 300

    if (!isVisible) return null

    return (
        <View
            style={{
                position: 'absolute',
                left: (SCREEN_WIDTH - EDGE_SIZE) / 2,
                top: (SCREEN_HEIGHT - EDGE_SIZE) / 2,
                zIndex: 1000,
                backgroundColor: 'transparent',
            }}
        >
            <LottieView
                source={require('@assets/animations-lottie/siri/Animation-1737472389132.lottie')}
                autoPlay
                loop
                speed={audioLevel + 0.5}
                style={{
                    width: EDGE_SIZE,
                    height: EDGE_SIZE,
                    backgroundColor: 'transparent',
                }}
                renderMode="SOFTWARE"
            />
        </View>
    )
}