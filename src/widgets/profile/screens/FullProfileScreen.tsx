import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useUser } from '@shared/context/user-provider'
import { View } from 'react-native'
import { ScreenType } from '../SettingModal'

export const FullProfileScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {
    const user = useUser()

    if (!user) {
        return null
    }

    return (

        <View>
            <HeaderMenuItem onBack={onBack} title={'profile.title'} />

        </View>
    )
}