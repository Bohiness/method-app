import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { ModalBottomContentView, View } from '@shared/ui/view'
import NewTask from '@widgets/plans/NewTask'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function NewTaskModal() {
    const { taskId } = useLocalSearchParams()
    const { getTaskById } = useOfflineTasks()
    const { data: task, isLoading } = getTaskById(Number(taskId))
    const insets = useSafeAreaInsets()

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <ModalBottomContentView>
            <NewTask
                mode={task ? 'edit' : 'create'}
                task={task}
            />
        </ModalBottomContentView>
    )
}       