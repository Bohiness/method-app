import { useTheme } from '@shared/context/theme-provider'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { cn } from '@shared/lib/utils/cn'
import { TaskType } from '@shared/types/plans/TasksTypes'
import { Checkbox } from '@shared/ui/checkbox'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { router } from 'expo-router'
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

export const TaskItem = React.memo(({ task }: TaskItemProps) => {
    const { colors } = useTheme()
    const [isPressed, setIsPressed] = useState(false)
    const { deleteTask, toggleTask } = useOfflineTasks()
    const translateX = useSharedValue(0)
    const { formateDataTimeWithTimezoneAndLocale } = useDateTime()

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: withSpring(
            isPressed
                ? colors.surface.stone
                : task.priority === 'low'
                    ? colors.success + '20'
                    : task.priority === 'medium'
                        ? colors.warning + '20'
                        : task.priority === 'high'
                            ? colors.error + '20'
                            : colors.transparent,
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
        router.push({
            pathname: '/(modals)/(plans)/new-task',
            params: {
                taskId: task.id
            }
        })
    }

    return (
        <View className="relative w-full">
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
                    onPress={() => toggleTask(task.id.toString())}
                    delayLongPress={500}
                    style={[animatedStyle]}
                    className={cn(
                        "flex-col rounded-lg py-3 px-2",
                        "active:bg-surface-paper",
                    )}
                >
                    <View className="flex-row items-center">
                        <Checkbox
                            checked={task.status === 'completed'}
                            onChange={() => toggleTask(task.id.toString())}
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
                    </View>
                    <View className="flex-row items-center">
                        <Text
                            size="sm"
                            variant='secondary'
                            className={cn("pl-9", task.status === 'completed' ? "line-through" : "")}
                        >
                            {formateDataTimeWithTimezoneAndLocale(task.start_datetime, 'HH:mm, EEEE')}
                        </Text>
                    </View>
                </AnimatedPressable>
            </GestureDetector>
        </View >
    )
})