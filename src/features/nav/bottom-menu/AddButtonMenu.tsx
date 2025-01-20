// src/features/nav/bottom-menu/AddButtonMenu.tsx
import { useAddMenu } from '@shared/context/add-menu-context'
import { useModal } from '@shared/context/modal-provider'
import { Button } from '@shared/ui/button'
import { IconName } from '@shared/ui/icon'
import { FullScreenModal } from '@shared/ui/modals/fullscreen-modal'
import { MoodCheckin } from '@widgets/diary/mood/MoodCheckin'
import NewTask from '@widgets/plans/NewTask'
import React, { useState } from 'react'
import { Dimensions, Pressable } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated'


export const AddButtonMenu = () => {
    const { isVisible, hide } = useAddMenu()
    const { height: screenHeight } = Dimensions.get('window')
    const [isMoodModalVisible, setIsMoodModalVisible] = useState(false)
    const { showBottomSheet, showFullScreenModal } = useModal()

    const handleOpenNewTask = () => {
        showBottomSheet(<NewTask />)
    }

    const handleOpenMoodCheckin = () => {
        showFullScreenModal(<MoodCheckin date={new Date()} />)
    }


    const menuItems: Array<{
        id: string
        icon: IconName
        title: string
        route?: string
        type?: string
        onPress?: () => void
    }> = [
            {
                id: 'mood',
                icon: 'Rabbit',
                title: 'Mood\nCheck-In',
                type: 'modal',
                onPress: handleOpenMoodCheckin,
            },
            {
                id: 'task',
                icon: 'Plus',
                title: 'New Task',
                type: 'modal',
                onPress: handleOpenNewTask,
            },
        ]


    const menuAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isVisible ? 1 : 0, {
                duration: 200,
                easing: Easing.ease,
            }),
            transform: [
                {
                    translateY: withSpring(isVisible ? 0 : 200, {
                        mass: 1,
                        damping: 20,
                        stiffness: 100,
                    }),
                },
            ],
        }
    })

    const overlayStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isVisible ? 1 : 0, {
                duration: 200,
                easing: Easing.ease,
            }),
        }
    })

    const handleItemPress = (item: typeof menuItems[0]) => {
        hide()
        item.onPress?.()
    }

    return (
        <>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        height: screenHeight,
                        zIndex: 999,
                        pointerEvents: isVisible ? 'auto' : 'none',
                    },
                ]}
            >
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                        overlayStyle,
                    ]}
                >
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={hide}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        menuAnimatedStyle,
                        {
                            position: 'absolute',
                            left: 16,
                            right: 16,
                            bottom: 100,
                        },
                    ]}
                >
                    {menuItems.map((item) => (
                        <Button
                            key={item.id}
                            onPress={() => handleItemPress(item)}
                            className="mb-2"
                            leftIcon={item.icon}
                        >
                            {item.title}
                        </Button>
                    ))}
                </Animated.View>
            </Animated.View>

            {/* Добавляем модальное окно MoodCheckin */}
            <FullScreenModal
                isVisible={isMoodModalVisible}
                onClose={() => setIsMoodModalVisible(false)}
                showCloseButton={true}
            >
                <MoodCheckin
                    date={new Date()}
                    onClose={() => setIsMoodModalVisible(false)}
                />
            </FullScreenModal>

        </>
    )
}