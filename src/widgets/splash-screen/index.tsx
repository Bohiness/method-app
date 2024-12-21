// src/widgets/splash-screen/index.tsx
import { useUser } from '@shared/context/user-provider'
import Constants from 'expo-constants'
import * as Updates from 'expo-updates'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Text, View } from 'react-native'

type UpdateStatus = 'checking' | 'available' | 'no-update' | 'error'

interface SplashScreenProps {
    onComplete: () => void
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
    const { checkAuth, isLoading } = useUser()
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('checking')
    const [updateError, setUpdateError] = useState<string | null>(null)

    const checkForUpdates = async () => {
        if (__DEV__ || Constants.appOwnership === 'expo') {
            setUpdateStatus('no-update')
            return
        }

        try {
            setUpdateStatus('checking')
            const update = await Updates.checkForUpdateAsync()

            if (update.isAvailable) {
                setUpdateStatus('available')
                await Updates.fetchUpdateAsync()
                await Updates.reloadAsync()
            } else {
                setUpdateStatus('no-update')
            }
        } catch (error) {
            setUpdateStatus('no-update')
            console.log('Update check skipped in development mode')
        }
    }

    const initialize = async () => {
        try {
            await checkForUpdates()
            const user = await checkAuth()
            onComplete()
            console.log('Initialization completed')
            console.log('User:', user)
        } catch (error) {
            console.error('Initialization failed:', error)
            onComplete()
        }
    }

    useEffect(() => {
        initialize()
    }, [])

    return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
            <Image
                source={require('@assets/images/logo.jpg')}
                className="w-32 h-32 mb-8"
                width={32}
                height={32}
            />
            <ActivityIndicator size="large" className="mb-4" />
            <Text className="text-gray-600 dark:text-gray-300 text-center px-4">
                {updateStatus === 'checking' && 'Проверка обновлений...'}
                {updateStatus === 'available' && 'Устанавливаем обновление...'}
                {updateStatus === 'error' && `Ошибка обновления: ${updateError}`}
                {updateStatus === 'no-update' && isLoading && 'Загрузка данных...'}
            </Text>
        </View>
    )
}