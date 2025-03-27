import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { TaskPriority } from '@shared/types/plans/TasksTypes'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { memo } from 'react'
import { View } from 'react-native'

export const PriorityButton = memo(({
    priority,
    onPriorityChange
}: {
    priority: TaskPriority | null,
    onPriorityChange: (priority: TaskPriority) => void
}) => {
    const { colors } = useTheme()

    // Получаем текст приоритета
    const getPriorityText = () => {
        switch (priority) {
            case 'low':
                return '!'
            case 'medium':
                return '!!'
            case 'high':
                return '!!!'
            case 'none':
                return ''
        }
    }

    // Получаем цвет в зависимости от приоритета
    const getPriorityColor = () => {
        switch (priority) {
            case 'low':
                return colors.success
            case 'medium':
                return colors.warning
            case 'high':
                return colors.error
            case 'none':
                return colors.text
        }
    }

    const handlePress = () => {
        const priorities: TaskPriority[] = ['none', 'low', 'medium', 'high']
        const currentIndex = priority ? priorities.indexOf(priority) : -1
        onPriorityChange(priorities[(currentIndex + 1) % priorities.length])
    }

    return (
        <Button
            onPress={handlePress}
            size='sm'
            variant='ghost'
            className="relative p-0"
        >
            <View className="relative">
                <Icon
                    name="Triangle"
                    size={28}
                    color={getPriorityColor()}
                />
                {priority && (
                    <Text
                        className={cn(
                            "absolute left-0 right-0 top-1/2 -translate-y-1/3 mt-[1px] text-center text-[9px] font-bold",
                            priority ? "text-text dark:text-text-dark" : "text-text-dark dark:text-text"
                        )}
                        style={{
                            // transform: [{ translateY: Platform.OS === 'ios' ? 2 : 0 }],
                            color: getPriorityColor()
                        }}
                    >
                        {getPriorityText()}
                    </Text>
                )}
            </View>
        </Button>
    )
})

PriorityButton.displayName = 'PriorityButton'