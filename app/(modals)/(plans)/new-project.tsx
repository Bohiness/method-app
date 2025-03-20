import { ProjectCreateOrUpdateModal } from '@entities/plans/projects/ProjectCreateOrUpdateModal'
import { useProject } from '@shared/hooks/plans/useProjects'
import { ProjectType } from '@shared/types/plans/ProjectTypes'
import { ModalBottomContentView } from '@shared/ui/view'
import { router, useLocalSearchParams } from 'expo-router'

export default function NewProjectModal() {
    const { projectID } = useLocalSearchParams<{ projectID: string }>()
    const { project } = useProject(Number(projectID))

    return (
        <ModalBottomContentView>
            <ProjectCreateOrUpdateModal
                project={project}
                isVisible={true}
                onClose={() => router.back()}
                onSuccess={(newProject: ProjectType) => {
                    router.back()
                }}
            />
        </ModalBottomContentView>
    )
}

