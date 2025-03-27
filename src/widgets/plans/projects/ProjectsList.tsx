import { useProjects } from '@shared/hooks/plans/useProjects'
import { ProjectType } from '@shared/types/plans/ProjectTypes'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { Card, View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProjectsList() {
    const { t } = useTranslation()
    const { projects, deleteProject, isLoading } = useProjects()
    const [selectedProject, setSelectedProject] = useState<ProjectType | undefined>()
    const insets = useSafeAreaInsets()

    const handleOpenModal = (project?: ProjectType) => {
        setSelectedProject(project)
        router.push({
            pathname: '/(modals)/(plans)/new-project',
            params: {
                projectID: project?.id,
            },
        })
    }

    // Обработчик удаления проекта
    const handleDeleteProject = (project: ProjectType) => {
        Alert.alert(
            t('plans.projects.delete.title'),
            t('plans.projects.delete.message'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('plans.projects.delete.button'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProject.mutateAsync(project.id)
                        } catch (error) {
                            Alert.alert(t('errors.title'), t('errors.deleteProject'))
                        }
                    },
                },
            ]
        )
    }

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>{t('common.loading')}</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 gap-y-6 px-4">

            <View className="flex-1 gap-y-4">
                {projects?.length === 0 && (
                    <View className="flex-1 justify-center items-center py-8">
                        <Text variant="secondary">
                            {t('plans.projects.list.noProjects')}
                        </Text>
                    </View>
                )}

                {projects && projects?.map((project) => (
                    <Card
                        key={project.id}
                    >
                        <View className="flex-row justify-between items-center">
                            <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: project.color }} />

                            <View className="flex-1">
                                <Text weight="bold" size="lg">{project.name}</Text>
                                {project.description && (
                                    <Text variant="secondary" className="mt-1">
                                        {project.description}
                                    </Text>
                                )}
                                {project.tasks_count && project.tasks_count > 0 && (
                                    <Text variant="secondary" size="sm" className="mt-1">
                                        {t('plans.projects.tasksCount', { count: project.tasks_count })}
                                    </Text>
                                )}
                            </View>

                            <View className="flex-row">
                                <Button
                                    variant="ghost"
                                    leftIcon='Pencil'
                                    size='sm'
                                    onPress={() => handleOpenModal(project)}
                                />

                                <Button
                                    variant="ghost"
                                    leftIcon='Trash2'
                                    iconProps={{ color: 'red' }}
                                    size='sm'
                                    onPress={() => handleDeleteProject(project)}
                                />
                            </View>
                        </View>
                    </Card>
                ))}
            </View>

            <Button
                leftIcon="Plus"
                variant="outline"
                style={{ marginBottom: insets.bottom }}
                onPress={() => handleOpenModal()}
            >
                {t('plans.projects.createProject.createButton')}
            </Button>

        </View>
    )
}
