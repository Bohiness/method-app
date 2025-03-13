import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import NewTask from '@widgets/plans/NewTask'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

export default function NewTaskModal() {
    const { taskId } = useLocalSearchParams()
    const { getTaskById } = useOfflineTasks()
    const { data: task, isLoading } = getTaskById(Number(taskId))

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return <NewTask
        mode={task ? 'edit' : 'create'}
        task={task}
    />
}       