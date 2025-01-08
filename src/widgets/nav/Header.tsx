import { useStreakStats } from '@hooks/gamification/useGamification'
import { useModal } from '@shared/context/modal-provider'
import { useUser } from '@shared/context/user-provider'
import { useScreenNavigation } from '@shared/hooks/modal/useScreenNavigation'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { ScreenType, SettingModal } from '@widgets/profile/SettingModal'
import { useRouter } from 'expo-router'
import { Image, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface HeaderProps {
    leftContent?: React.ReactNode
    showLeftContent?: boolean
}

export const Header: React.FC<HeaderProps> = ({
    leftContent,
    showLeftContent = true
}) => {
    const router = useRouter()
    const { user } = useUser()
    const insets = useSafeAreaInsets()
    const { current_streak } = useStreakStats()
    const navigation = useScreenNavigation<ScreenType>('main')

    const { showBottomSheet } = useModal()

    const handleProfilePress = () => {
        showBottomSheet(<SettingModal />)
        navigation.navigate('main')
    }

    return (
        <View
            className="bg-background dark:bg-background-dark"
            style={{
                paddingTop: insets.top,
                paddingRight: insets.right,
                paddingLeft: insets.left
            }}
        >
            <View className="flex-row align-center justify-between px-6 py-2">
                {showLeftContent && (
                    leftContent || (
                        <Pressable
                            className="w-10 h-10 flex-row rounded-full items-center justify-center"
                        >
                            <Icon
                                name="Flame"
                                size={20}
                                variant="secondary"
                                className="ml-2"
                            />
                            <Text
                                variant="secondary"
                                size="xl"
                                weight="medium"
                            >
                                {current_streak || 0}
                            </Text>
                        </Pressable>
                    )
                )}

                <Pressable
                    onPress={handleProfilePress}
                    className="size-8 rounded-full bg-profile dark:bg-profile-dark items-center justify-center ml-auto"
                >
                    {user?.profile_photo ? (
                        <Image
                            source={{ uri: user.profile_photo }}
                            className="w-full h-full rounded-full"
                        />
                    ) : (
                        <Icon
                            name="User"
                            size={20}
                            variant="secondary"
                        />
                    )}
                </Pressable>
            </View>
        </View>
    )
}