import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { MenuItem } from '@shared/ui/modals/menu-item'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function SettingsScreen() {
    const { t } = useTranslation()

    return (
        <ModalBottomScreenContent title={'tasks_history_title'}>
            <View className="flex-1">
                <View className='gap-y-4'>
                    <MenuItem
                        isFirst
                        isLast
                        showSeparator
                        onPress={() => {
                            router.replace('/(modals)/(plans)/settings/tasks-history')
                        }}
                        label={t('plans.settings.history.menuItem')}
                    />
                    <MenuItem
                        isFirst
                        isLast
                        showSeparator
                        onPress={() => {
                            router.replace('/(modals)/(plans)/settings/projects-list')
                        }}
                        label={t('plans.settings.projects.menuItem')}
                    />
                </View>
            </View>
        </ModalBottomScreenContent>
    )
}   