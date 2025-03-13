// app/(coach)/coaches.tsx
import { CheckConnect } from '@features/system/CheckConnect'
import { ContainerWithSafeArea } from '@shared/ui/view'
import { CoachesWidgets } from '@widgets/coaches/coach-widgets/CoachesWidgets'
import { useTranslation } from 'react-i18next'


export default function CoachesScreen() {
    const { t } = useTranslation()
    return (
        <ContainerWithSafeArea>
            <CheckConnect>
                <CoachesWidgets showTitle={false} />
            </CheckConnect>
        </ContainerWithSafeArea>
    )
}