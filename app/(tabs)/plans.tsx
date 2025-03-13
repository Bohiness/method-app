import { Container } from '@shared/ui/view'
import TaskManager from '@widgets/plans/TaskManager'
import { useTranslation } from 'react-i18next'


export default function PlansScreen() {
    const { t } = useTranslation()


    return (
        <Container>
            <TaskManager />
        </Container>
    )
}