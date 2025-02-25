// src/shared/ui/Backdrop.tsx
import { Portal } from '@gorhom/portal'
import { Pressable, StyleSheet } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

interface BackdropProps {
    visible: boolean
    onPress?: () => void
}

export function Backdrop({ visible, onPress }: BackdropProps) {
    if (!visible) return null

    return (
        <Portal>
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.backdrop
                ]}
            >
                <Pressable
                    style={StyleSheet.absoluteFillObject}
                    onPress={onPress}
                />
            </Animated.View>
        </Portal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
})