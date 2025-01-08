import { useColorScheme } from '@shared/context/theme-provider'
import { Text } from '@shared/ui/text'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react-native'
import React from 'react'
import { View } from 'react-native'

interface DayProgressProps {
    date: string
    isCompleted: boolean
    tasksCompleted: number
}

export const DayProgress = ({ date, isCompleted, tasksCompleted }: DayProgressProps) => {
    const colorScheme = useColorScheme()

    return (
        <View className="items-center">
            <Text size="sm" variant="secondary">
                {format(new Date(date), 'E')}
            </Text>
            <View
                className={`w-8 h-8 rounded-full items-center justify-center mt-1
                    ${isCompleted
                        ? colorScheme === 'dark' ? 'bg-tint-dark' : 'bg-tint'
                        : colorScheme === 'dark' ? 'bg-surface-paper-dark' : 'bg-surface-paper'}`
                }
            >
                <Calendar size={16} color={isCompleted ? '#fff' : '#A3A3A3'} />
            </View>
            {tasksCompleted > 0 && (
                <Text size="xs" variant="secondary" className="mt-1">
                    {tasksCompleted}
                </Text>
            )}
        </View>
    )
}