import { useUser } from '@shared/context/user-provider'
import { Avatar } from '@shared/ui/avatar'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { router } from 'expo-router'

export function UserHeaderButton() {
    const { user } = useUser()

    const handleProfilePress = () => {
        router.push({
            pathname: '/(modals)/(profile)/settings',
            params: {
                startScreen: 'main'
            }
        })
    }

    return (
        <Button
            variant="ghost"
            onPress={handleProfilePress}
            size='sm'
        >
            {user?.profile_photo ? (
                <Avatar
                    source={{ uri: user.profile_photo }}
                    size="xs"
                    shape="circle"
                />
            ) : (
                <Icon
                    name="User"
                    size={24}
                    variant="secondary"
                />
            )}
        </Button>
    )
}