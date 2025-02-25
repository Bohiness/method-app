import { ProjectCreateOrUpdateModal } from '@entities/plans/projects/ProjectCreateOrUpdateModal'
import { useModal } from '@shared/context/modal-provider'
import { useProjects } from '@shared/hooks/plans/useProjects'
import { ProjectType } from '@shared/types/plans/ProjectTypes'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { Card, View } from '@shared/ui/view'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

const ProjectsList = () => {
    const { t } = useTranslation()
    const { projects, deleteProject, isLoading } = useProjects()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedProject, setSelectedProject] = useState<ProjectType | undefined>()
    const { showModal, hideModal } = useModal()

    const handleOpenModal = (project?: ProjectType) => {
        setSelectedProject(project)
        showModal(
            <ProjectCreateOrUpdateModal
                project={selectedProject}
                isVisible={isModalVisible}
                onClose={hideModal}
                onSuccess={handleSuccess}
            />, {
            type: 'fullScreen',
            showCloseButton: true
        }
        )
    }

    const handleSuccess = (project: ProjectType) => {
        hideModal()
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
        <View className="flex-1">
            <View className="space-y-4">
                {projects?.map((project) => (
                    <Card
                        key={project.id}
                        className="p-4 space-y-2"
                        style={{ borderLeftWidth: 4, borderLeftColor: project.color }}
                    >
                        <View className="flex-row justify-between items-center">
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

                            <View className="flex-row space-x-2">
                                <Button
                                    variant="ghost"
                                    onPress={() => handleOpenModal(project)}
                                >
                                    <Icon name="Pencil" size={20} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    onPress={() => handleDeleteProject(project)}
                                >
                                    <Icon name="Trash2" size={20} variant="error" />
                                </Button>
                            </View>
                        </View>
                    </Card>
                ))}

                {projects?.length === 0 && (
                    <View className="flex-1 justify-center items-center py-8">
                        <Text variant="secondary">
                            {t('plans.projects.list.noProjects')}
                        </Text>
                    </View>
                )}
            </View>

            <Button
                leftIcon="Plus"
                variant="outline"
                className="mb-4"
                onPress={() => handleOpenModal()}
            >
                {t('plans.projects.createProject.createButton')}
            </Button>

        </View>
    )
}

export default ProjectsList