import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { SettingModal } from '@widgets/profile/SettingModal'
import { router, useLocalSearchParams } from 'expo-router'

export default function Settings() {
    const { startScreen, title } = useLocalSearchParams()

    return (
        <ModalBottomScreenContent
            title={title as string}
            headerOnClose={() => {
                router.dismissTo('/(tabs)')
            }}
        >
            <SettingModal startScreen={startScreen as ScreenType} />
        </ModalBottomScreenContent>
    )
}