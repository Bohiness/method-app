import { useModal } from '@shared/context/modal-provider'
import { useTheme } from '@shared/context/theme-provider'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { cn } from '@shared/lib/utils/cn'
import { TaskType } from '@shared/types/plans/TasksTypes'
import { Checkbox } from '@shared/ui/checkbox'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import NewTask from '@widgets/plans/NewTask'
import React, { useState } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated'

interface TaskItemProps {
    task: TaskType
    onToggle: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const SCREEN_WIDTH = Dimensions.get('window').width
const DELETE_THRESHOLD = -80
const FULL_DELETE_THRESHOLD = -120

export const TaskItem = React.memo(({ task, onToggle }: TaskItemProps) => {
    const { showBottomSheet } = useModal()
    const { colors } = useTheme()
    const [isPressed, setIsPressed] = useState(false)
    const { deleteTask } = useOfflineTasks()
    const translateX = useSharedValue(0)

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: withSpring(
            isPressed ? colors.surface.stone : colors.transparent,
            {
                mass: 0.5,
                damping: 12,
                stiffness: 150,
            }
        ),
        transform: [
            { translateX: translateX.value },
            {
                scale: withSpring(isPressed ? 0.98 : 1, {
                    mass: 0.5,
                    damping: 12,
                    stiffness: 150,
                })
            }
        ]
    }))

    // Стили для иконки удаления
    const deleteIconStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, DELETE_THRESHOLD],
            [0, 1],
            Extrapolate.CLAMP
        )
        const scale = interpolate(
            translateX.value,
            [DELETE_THRESHOLD, FULL_DELETE_THRESHOLD],
            [1, 1.2],
            Extrapolate.CLAMP
        )

        return {
            opacity,
            transform: [{ scale }],
        }
    })

    const handleDelete = async () => {
        try {
            await deleteTask.mutateAsync(task.id)
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }

    const gesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.value = Math.min(0, event.translationX)
        })
        .onEnd(() => {
            if (translateX.value < FULL_DELETE_THRESHOLD) {
                translateX.value = withTiming(-SCREEN_WIDTH, {}, () => {
                    runOnJS(handleDelete)()
                })
            } else {
                translateX.value = withSpring(0)
            }
        })

    const handleLongPress = () => {
        showBottomSheet(
            <NewTask
                mode="edit"
                task={task}
            />
        )
    }

    return (
        <View className="relative">
            {/* Иконка удаления */}
            <Animated.View
                className="absolute right-4 h-full justify-center items-center"
                style={deleteIconStyle}
            >
                <Icon
                    name="Trash2"
                    size={24}
                    color={colors.error}
                />
            </Animated.View>

            <GestureDetector gesture={gesture}>
                <AnimatedPressable
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                    onLongPress={handleLongPress}
                    onPress={onToggle}
                    delayLongPress={500}
                    style={animatedStyle}
                    className={cn(
                        "flex-row items-center rounded-lg py-3 mb-1 w-full",
                        "active:bg-surface-paper dark:active:bg-surface-paper-dark"
                    )}
                >
                    <Checkbox
                        checked={task.status === 'completed'}
                        onChange={onToggle}
                        className="mr-3"
                    />

                    <Text
                        className={cn(
                            "flex-1",
                            task.status === 'completed'
                                ? "line-through text-secondary-light dark:text-secondary-light-dark"
                                : "text-text dark:text-text-dark"
                        )}
                        size="base"
                    >
                        {task.text}
                    </Text>
                </AnimatedPressable>
            </GestureDetector>
        </View>
    )
})