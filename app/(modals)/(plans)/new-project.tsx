import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { ProjectCreateOrUpdateModal } from '@entities/plans/projects/ProjectCreateOrUpdateModal'
import { useProject } from '@shared/hooks/plans/useProjects'
import { ProjectType } from '@shared/types/plans/ProjectTypes'
import { router, useLocalSearchParams } from 'expo-router'

export default function NewProjectModal() {
    const { projectID } = useLocalSearchParams<{ projectID: string }>()
    const { project } = useProject(Number(projectID))

    return (
        <ModalBottomScreenContent>
            <ProjectCreateOrUpdateModal
                project={project}
                isVisible={true}
                onClose={() => router.back()}
                onSuccess={(newProject: ProjectType) => {
                    router.back()
                }}
            />
        </ModalBottomScreenContent>
    )
}

