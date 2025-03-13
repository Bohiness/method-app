import { Colors } from '@shared/constants/colors'
import { useHabits } from '@shared/hooks/plans/useHabits'
import { HabitType } from '@shared/types/plans/HabitTypes'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, TouchableOpacity } from 'react-native'

interface HabitItemProps {
    habit?: HabitType
    onEdit?: () => void
    title?: string
    isNew?: boolean
}

export function HabitItem({ habit, onEdit, isNew = false, title }: HabitItemProps) {
    const { completeHabit } = useHabits()
    const [loading, setLoading] = useState(false)


    const handlePressNewHabit = () => {
        router.push('/(modals)/(plans)/new-habit')
    }


    if (isNew) {
        return (

            <TouchableOpacity
                className="items-center"
                onPress={handlePressNewHabit}
                disabled={loading}
            >
                <View
                    className="w-[60px] h-[60px] rounded-full border-[3px] justify-center items-center"
                    style={{ borderColor: Colors.light.border }}
                >
                    <View
                        className="w-[54px] h-[54px] rounded-full justify-center items-center"
                        style={{ backgroundColor: Colors.light.background, borderColor: Colors.light.border }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View className="items-center">
                                <Text className="text-2xl text-white">
                                    <Icon name='Plus' size={24} color={Colors.light.text} />
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                <Text variant='secondary' size='sm' className="mt-2">{title}</Text>
            </TouchableOpacity>
        )
    }

    if (!habit) return null

    const currentColor = loading ? '#808080' : habit.color

    // Завершает привычку при нажатии
    const handlePress = async () => {
        setLoading(true)
        try {
            await completeHabit.mutateAsync({ habitId: habit.id })
        } finally {
            setLoading(false)
        }
    }

    // При длительном нажатии открывает окно редактирования привычки
    const handleLongPress = () => {
        if (onEdit) {
            onEdit()
        } else {
            Alert.alert('Редактирование', 'Открыть окно редактирования привычки')
        }
    }


    if (!habit) return null

    return (
        <TouchableOpacity
            className="items-center"
            onPress={handlePress}
            onLongPress={handleLongPress}
            disabled={loading}
        >
            <View
                className="w-[60px] h-[60px] rounded-full border-[3px] justify-center items-center"
                style={{ borderColor: currentColor }}
            >
                <View
                    className="w-[54px] h-[54px] rounded-full border-[2px] justify-center items-center"
                    style={{ backgroundColor: currentColor, borderColor: currentColor }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View className="items-center">
                            <Text className="text-2xl text-white">⭐</Text>
                            <Text className="text-sm text-white mt-1">
                                {habit.total_completions}/{habit.daily_target}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <Text className="mt-2 text-base text-black">{habit.title}</Text>
        </TouchableOpacity>
    )
}