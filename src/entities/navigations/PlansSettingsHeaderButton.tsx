import { Button } from '@shared/ui/button'
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
            leftIcon="Settings"
        >
        </Button>
    )
}