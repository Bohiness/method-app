import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import ProjectsList from '@widgets/plans/projects/ProjectsList'
import { useTranslation } from 'react-i18next'

export default function ProjectsListModal() {
    const { t } = useTranslation()

    return (
        <ModalBottomScreenContent title={t('screens.settings.projects.title')}>
            <ProjectsList />
        </ModalBottomScreenContent>
    )
}