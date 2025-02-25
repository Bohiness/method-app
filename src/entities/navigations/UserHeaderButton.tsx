import { useUser } from '@shared/context/user-provider'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Image } from '@shared/ui/image'
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
                <Image
                    source={{ uri: user.profile_photo }}
                    className="size-8 rounded-full"
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