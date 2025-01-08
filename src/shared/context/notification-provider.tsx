// src/context/NotificationProvider.tsx
import * as Notifications from 'expo-notifications'
import React, { createContext, useContext, useEffect, useRef } from 'react'

interface NotificationContextProps {
    // Здесь можно добавить функции или данные, связанные с уведомлениями
    scheduleNotification: (content: Notifications.NotificationContentInput, trigger?: Notifications.NotificationTriggerInput) => Promise<string>
}

const NotificationContext = createContext<NotificationContextProps | null>(null)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const notificationListener = useRef<any>()
    const responseListener = useRef<any>()

    useEffect(() => {
        // Настраиваем глобальное поведение уведомлений
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        })

        // Слушаем получение уведомлений
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Получено уведомление:', notification)
        })

        // Слушаем нажатия на уведомления
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Нажатие на уведомление:', response)
        })

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current)
            Notifications.removeNotificationSubscription(responseListener.current)
        }
    }, [])

    // Пример функции для планирования уведомлений
    const scheduleNotification = async (content: Notifications.NotificationContentInput, trigger?: Notifications.NotificationTriggerInput) => {
        return Notifications.scheduleNotificationAsync({ content, trigger })
    }

    return (
        <NotificationContext.Provider value={{ scheduleNotification }}>
            {children}
        </NotificationContext.Provider>
    )
}

// Хук для использования контекста
export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}