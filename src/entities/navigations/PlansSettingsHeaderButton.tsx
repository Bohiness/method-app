import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { router } from 'expo-router'

export const PlansSettingsHeaderButton = () => {

    const handlePress = () => {
        router.push({
            pathname: '/(modals)/(plans)/settings',
        })
    }

    return (
        <Button
            variant="ghost"
            onPress={handlePress}
            size='sm'
        >
            <Icon
                name="Settings"
                size={24}
                variant="secondary"
            />
        </Button>
    )
}