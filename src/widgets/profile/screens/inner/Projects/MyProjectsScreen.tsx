import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { View } from '@shared/ui/view'
import ProjectsList from '@widgets/plans/projects/ProjectsList'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const MyProjectsScreen = ({ onBack }: { onBack: () => void }) => {
    const { t } = useTranslation()

    return (
        <View className="flex-1">
            <HeaderMenuItem
                onBack={onBack}
                title={t('plans.projects.title')}
            />

            <ProjectsList />
        </View>
    )
}

export default MyProjectsScreen