import { Button } from '@shared/ui/button'
import { router } from 'expo-router'

export const PlansSettingsHeaderButton = () => {
    return (
        <Button
            variant="ghost"
            onPress={() =>
                router.push({
                    pathname: '/(modals)/(profile)/settings',
                    params: {
                        startScreen: 'plans'
                    }
                })
            }
            leftIcon="Settings"
        >
        </Button>
    )
}