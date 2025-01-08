import { useTheme } from '@shared/context/theme-provider'
import { useNetwork } from '@shared/hooks/systems/network/useNetwork'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert'
import { WifiOff } from 'lucide-react-native'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'

interface CheckConnectProps {
    children?: React.ReactNode
}

export const CheckConnect = ({ children }: CheckConnectProps) => {
    const { isOnline } = useNetwork()
    const { t } = useTranslation()
    const { colors } = useTheme()

    useEffect(() => {
        console.log('CheckConnect isOnline:', isOnline)
    }, [isOnline])

    if (!isOnline) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Alert variant="destructive" className="w-full max-w-md">
                    <WifiOff className="h-6 w-6 mb-2" color={colors.error} />
                    <AlertTitle className="text-lg font-bold mb-2">
                        {t('network.offline.title')}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-gray-600">
                        {t('network.offline.description')}
                    </AlertDescription>
                    <ActivityIndicator className="mt-4" size="small" color={colors.error} />
                </Alert>
            </View>
        )
    }

    if (!children) {
        return null
    }

    return children
}