import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { SettingModal } from '@widgets/profile/SettingModal'
import { useLocalSearchParams } from 'expo-router'

export default function Settings() {
    const { startScreen } = useLocalSearchParams()
    return <SettingModal startScreen={startScreen as ScreenType} />
}