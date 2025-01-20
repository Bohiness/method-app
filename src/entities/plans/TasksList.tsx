import { TaskType } from '@shared/types/plans/TasksTypes'
import { Text } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { TaskItem } from './TaskItem'

export const TasksList = ({
    tasks,
    onToggleTask,
    isLoading,
    error
}: {
    tasks: TaskType[]
    onToggleTask: (taskId: string) => void
    isLoading: boolean
    error: Error | null
}) => {
    const { t } = useTranslation()

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="flex-wrap mt-4"
        >
            {tasks?.length > 0 ? (
                tasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={() => onToggleTask(task.id.toString())}
                    />
                ))
            ) : (
                <Text variant='secondary'>{t('tasks.list.noTasks')}</Text>
            )}
        </Animated.View>
    )
}