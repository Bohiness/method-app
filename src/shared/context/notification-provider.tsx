// src/shared/context/notification-provider.tsx
import { notificationsApiService } from '@shared/api/notifications/notifications-api.service'
import { LocalNotification, notificationsService } from '@shared/lib/notifications/notifications.service'
import {
    NotificationCategory,
    NotificationHistory,
    NotificationSettings
} from '@shared/types/notifications/NotificationTypes'
import * as Notifications from 'expo-notifications'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

interface NotificationContextProps {
    // Основные функции для работы с уведомлениями
    scheduleLocalNotification: (notification: LocalNotification) => Promise<string>
    cancelNotification: (id: string) => Promise<void>
    cancelAllNotifications: () => Promise<void>

    // Настройки уведомлений
    settings: NotificationSettings | null
    updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>
    registerForPushNotifications: () => Promise<void>

    // Новый метод для проверки актуальных разрешений
    checkActualPermissions: () => Promise<boolean>

    // Категории уведомлений
    categories: NotificationCategory[]
    updateCategoryPreference: (categoryId: string, enabled: boolean) => Promise<void>

    // История уведомлений
    notificationHistory: NotificationHistory[]
    loadMoreHistory: () => Promise<void>
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (notificationId: string) => Promise<void>

    // Состояние
    isLoading: boolean
    hasMoreHistory: boolean
    currentPage: number
}

const NotificationContext = createContext<NotificationContextProps | null>(null)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Состояние
    const [settings, setSettings] = useState<NotificationSettings | null>(null)
    const [categories, setCategories] = useState<NotificationCategory[]>([])
    const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMoreHistory, setHasMoreHistory] = useState(true)

    // Refs для слушателей уведомлений
    const notificationListener = useRef<any>()
    const responseListener = useRef<any>()

    // Инициализация
    useEffect(() => {
        initializeNotifications()
        return () => cleanup()
    }, [])

    // Новый метод для проверки актуальных системных разрешений
    const checkActualPermissions = async (): Promise<boolean> => {
        try {
            const { status } = await Notifications.getPermissionsAsync()
            const isEnabled = status === 'granted'

            // Если есть несоответствие между системными разрешениями и внутренним состоянием
            if (settings && settings.push_enabled !== isEnabled) {
                // Обновляем внутреннее состояние согласно системным разрешениям
                await updateSettings({ push_enabled: isEnabled })
            }

            return isEnabled
        } catch (error) {
            console.error('Ошибка при проверке разрешений на уведомления:', error)
            return false
        }
    }

    const initializeNotifications = async () => {
        try {
            setIsLoading(true)

            // Загружаем базовые настройки
            const userSettings = await notificationsApiService.getNotificationSettings()
            setSettings(userSettings)

            // Проверяем актуальные системные разрешения и синхронизируем с нашими настройками
            await checkActualPermissions()

            // Загружаем категории
            const notificationCategories = await notificationsApiService.getNotificationCategories()
            setCategories(notificationCategories)

            // Загружаем историю
            await loadHistory(1)

            // Настраиваем обработчики уведомлений
            setupNotificationHandlers()
        } catch (error) {
            console.error('Ошибка инициализации уведомлений:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Новый метод для регистрации push-уведомлений
    const registerForPushNotifications = async () => {
        try {
            setIsLoading(true)
            await notificationsService.registerForPushNotifications()

            // После успешной регистрации обновляем настройки
            const userSettings = await notificationsApiService.getNotificationSettings()
            setSettings(userSettings)

            // Проверяем актуальные разрешения для синхронизации
            await checkActualPermissions()
        } catch (error) {
            console.error('Ошибка регистрации push-уведомлений:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const setupNotificationHandlers = () => {
        // Настраиваем глобальный обработчик
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: settings?.push_enabled ?? true,
                shouldPlaySound: settings?.sound_enabled ?? true,
                shouldSetBadge: true,
            }),
        })

        // Слушатель входящих уведомлений
        notificationListener.current = Notifications.addNotificationReceivedListener(
            notification => {
                console.log('Получено уведомление:', notification)
                // Добавляем уведомление в историю
                const newNotification: NotificationHistory = {
                    id: notification.request.identifier,
                    title: notification.request.content.title || '',
                    body: notification.request.content.body || '',
                    data: notification.request.content.data,
                    read: false,
                    created_at: new Date().toISOString()
                }
                setNotificationHistory(prev => [newNotification, ...prev])
            }
        )

        // Слушатель нажатий на уведомления
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            async response => {
                console.log('Нажатие на уведомление:', response)
                const notificationId = response.notification.request.identifier
                await markAsRead(notificationId)
            }
        )
    }

    const cleanup = () => {
        if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current)
        }
        if (responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current)
        }
    }

    // Методы для работы с локальными уведомлениями
    const scheduleLocalNotification = async (notification: LocalNotification) => {
        return await notificationsService.scheduleLocalNotification(notification)
    }

    const cancelNotification = async (id: string) => {
        await notificationsService.cancelNotification(id)
    }

    const cancelAllNotifications = async () => {
        await notificationsService.cancelAllLocalNotifications()
    }

    // Методы для работы с настройками
    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        try {
            const updatedSettings = await notificationsApiService.updateNotificationSettings(newSettings)
            setSettings(updatedSettings)
        } catch (error) {
            console.error('Ошибка обновления настроек:', error)
            throw error
        }
    }

    // Методы для работы с категориями
    const updateCategoryPreference = async (categoryId: string, enabled: boolean) => {
        try {
            await notificationsApiService.updateCategoryPreferences(categoryId, enabled)
            setCategories(prev =>
                prev.map(cat =>
                    cat.id === categoryId ? { ...cat, enabled } : cat
                )
            )
        } catch (error) {
            console.error('Ошибка обновления настроек категории:', error)
            throw error
        }
    }

    // Методы для работы с историей
    const loadHistory = async (page: number) => {
        try {
            const response = await notificationsApiService.getNotificationHistory(page)

            if (response && response.results) {
                if (page === 1) {
                    setNotificationHistory(response.results)
                } else {
                    setNotificationHistory(prev => [...prev, ...response.results])
                }
            } else {
                console.error('Ошибка загрузки истории: отсутствует response.results')
            }

            setHasMoreHistory(!!response.next)
            setCurrentPage(page)
        } catch (error) {
            console.error('Ошибка загрузки истории:', error)
            throw error
        }
    }

    const loadMoreHistory = async () => {
        if (!hasMoreHistory || isLoading) return
        await loadHistory(currentPage + 1)
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationsApiService.markNotificationAsRead(notificationId)
            setNotificationHistory(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true, read_at: new Date().toISOString() }
                        : notification
                )
            )
        } catch (error) {
            console.error('Ошибка отметки уведомления как прочитанного:', error)
            throw error
        }
    }

    const markAllAsRead = async () => {
        try {
            await notificationsApiService.markAllNotificationsAsRead()
            setNotificationHistory(prev =>
                prev.map(notification => ({
                    ...notification,
                    read: true,
                    read_at: new Date().toISOString()
                }))
            )
        } catch (error) {
            console.error('Ошибка отметки всех уведомлений как прочитанных:', error)
            throw error
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            await notificationsApiService.deleteNotificationFromHistory(notificationId)
            setNotificationHistory(prev =>
                prev.filter(notification => notification.id !== notificationId)
            )
        } catch (error) {
            console.error('Ошибка удаления уведомления:', error)
            throw error
        }
    }

    const value: NotificationContextProps = {
        scheduleLocalNotification,
        cancelNotification,
        cancelAllNotifications,
        settings,
        updateSettings,
        categories,
        updateCategoryPreference,
        notificationHistory,
        loadMoreHistory,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading,
        hasMoreHistory,
        currentPage,
        registerForPushNotifications,
        checkActualPermissions
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}