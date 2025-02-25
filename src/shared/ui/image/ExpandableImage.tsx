import { View } from '@shared/ui/view'
import React, { useEffect, useState } from 'react'
import { Dimensions, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated'
import { Image } from '../image'

interface ExpandableImageProps {
    source: any
    style?: any
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
    className?: string
}

export const ExpandableImage: React.FC<ExpandableImageProps> = ({
    source,
    style,
    resizeMode = 'cover',
    className
}) => {
    const [modalVisible, setModalVisible] = useState(false)
    const { width, height } = Dimensions.get('window')

    // Анимационные значения
    const fadeAnim = useSharedValue(0)
    const scaleAnim = useSharedValue(0.8)

    // Значения для жестов масштабирования и панорамирования
    const scale = useSharedValue(1)
    const savedScale = useSharedValue(1)
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const savedTranslateX = useSharedValue(0)
    const savedTranslateY = useSharedValue(0)

    useEffect(() => {
        if (modalVisible) {
            fadeAnim.value = withTiming(1, { duration: 250 })
            scaleAnim.value = withSpring(1, { damping: 15 })
        }
    }, [modalVisible])

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale
        })
        .onEnd(() => {
            savedScale.value = scale.value
            if (scale.value < 1) {
                scale.value = withSpring(1)
                savedScale.value = 1
            }
        })

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX
                translateY.value = savedTranslateY.value + e.translationY
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value
            savedTranslateY.value = translateY.value
        })

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1) {
                scale.value = withSpring(1)
                savedScale.value = 1
                translateX.value = withSpring(0)
                translateY.value = withSpring(0)
                savedTranslateX.value = 0
                savedTranslateY.value = 0
            } else {
                scale.value = withSpring(2)
                savedScale.value = 2
            }
        })

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ]
        }
    })

    const overlayStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeAnim.value,
        }
    })

    const imageContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeAnim.value,
            transform: [{ scale: scaleAnim.value }]
        }
    })

    const resetZoom = () => {
        scale.value = 1
        savedScale.value = 1
        translateX.value = 0
        translateY.value = 0
        savedTranslateX.value = 0
        savedTranslateY.value = 0
    }

    const handleOpen = () => {
        setModalVisible(true)
    }

    const handleClose = () => {
        fadeAnim.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.ease),
        })
        scaleAnim.value = withTiming(0.8, {
            duration: 250,
            easing: Easing.out(Easing.ease),
        }, () => {
            runOnJS(finalizeClose)()
        })
    }

    const finalizeClose = () => {
        setModalVisible(false)
        resetZoom()
    }

    const combinedGestures = Gesture.Exclusive(
        doubleTapGesture,
        Gesture.Simultaneous(pinchGesture, panGesture)
    )

    return (
        <>
            <TouchableOpacity activeOpacity={0.8} onPress={handleOpen}>
                <View style={style}>
                    <Image
                        source={source}
                        resizeMode={resizeMode}
                        className={className}
                    />
                </View>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={handleClose}
                statusBarTranslucent
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.modalContainer}>
                        <View style={styles.contentContainer}>
                            <Animated.View style={[styles.imageContainer, imageContainerStyle]}>
                                <GestureDetector gesture={combinedGestures}>
                                    <Animated.Image
                                        source={source}
                                        style={[
                                            { width: width * 0.9, height: height * 0.7, resizeMode: 'contain' },
                                            animatedStyle
                                        ]}
                                    />
                                </GestureDetector>
                            </Animated.View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
}) 