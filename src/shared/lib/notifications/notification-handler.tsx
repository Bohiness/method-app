import { useNavigation } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import React, { useEffect, useRef } from 'react'

// Настраиваем обработчик уведомлений для приложения
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
})

interface NotificationHandlerProps {
    children: React.ReactNode
}

export const NotificationHandler: React.FC<NotificationHandlerProps> = ({ children }) => {
    const notificationListener = useRef<Notifications.Subscription>()
    const responseListener = useRef<Notifications.Subscription>()
    const navigation = useNavigation()

    useEffect(() => {
        // Слушаем получение уведомлений, когда приложение находится на переднем плане
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('Уведомление получено:', notification)
            }
        )

        // Слушаем нажатия на уведомления
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const { notification } = response
                const data = notification.request.content.data

                console.log('Нажатие на уведомление:', data)

                // Обрабатываем навигацию в зависимости от типа уведомления
                if (data && data.screen) {
                    handleNotificationNavigation(data)
                }
            }
        )

        // Очистка слушателей при размонтировании компонента
        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current)
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current)
            }
        }
    }, [navigation])

    // Обработка навигации при нажатии на уведомление
    const handleNotificationNavigation = (data: any) => {
        try {
            const { screen, type } = data

            if (screen === 'StartYourDay') {
                // Навигация к экрану утренней подготовки
                navigation.navigate('StartYourDay' as never)
            } else if (screen === 'EveningReflection') {
                // Навигация к экрану вечерней рефлексии
                navigation.navigate('EveningReflection' as never)
            }
        } catch (error) {
            console.error('Ошибка при обработке навигации по уведомлению:', error)
        }
    }

    return <>{children}</>
}

// Функция для проверки и запроса разрешений на уведомления
export const checkAndRequestNotificationPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()

    if (existingStatus === 'granted') {
        return true
    }

    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
} 