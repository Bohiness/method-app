import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { View } from '@shared/ui/view'
import NewTask from '@widgets/plans/NewTask'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'

export default function NewTaskModal() {
    const { taskId } = useLocalSearchParams()
    const { getTaskById } = useOfflineTasks()
    const { data: task, isLoading } = getTaskById(Number(taskId))
    const { t } = useTranslation()

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <ModalBottomScreenContent title={t(task ? 'common.edit' : 'plans.tasks.new.title')}>
            <NewTask
                mode={task ? 'edit' : 'create'}
                task={task}
            />
        </ModalBottomScreenContent>
    )
}       