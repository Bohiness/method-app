import { dailyNotificationsService } from '@shared/lib/notifications/daily-notifications.service'
import { checkAndRequestNotificationPermissions } from '@shared/lib/notifications/notification-handler'
import { notificationsService } from '@shared/lib/notifications/notifications.service'
import { Button } from '@shared/ui/button'
import { Switch } from '@shared/ui/switch'
import { Text } from '@shared/ui/text'
import { TimePicker } from '@shared/ui/time-picker'
import { View } from '@shared/ui/view'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

export const DailyNotificationsSettings: React.FC = () => {
    const { t } = useTranslation()

    // Состояния для ежедневных уведомлений
    const [morningEnabled, setMorningEnabled] = useState(false)
    const [eveningEnabled, setEveningEnabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [hasPermission, setHasPermission] = useState(false)

    // Состояния для выбора времени
    const [morningTime, setMorningTime] = useState(new Date().setHours(8, 55, 0, 0))
    const [eveningTime, setEveningTime] = useState(new Date().setHours(20, 55, 0, 0))

    // Проверяем разрешения и текущие уведомления при загрузке экрана
    useEffect(() => {
        checkPermissionsAndNotifications()
    }, [])

    // Проверка разрешений и текущих уведомлений
    const checkPermissionsAndNotifications = async () => {
        try {
            setLoading(true)

            // Проверяем разрешения
            const permissionGranted = await checkAndRequestNotificationPermissions()
            setHasPermission(permissionGranted)

            if (permissionGranted) {
                // Получаем текущие запланированные уведомления
                const notifications = await notificationsService.getScheduledNotifications()

                // Проверяем, есть ли утреннее уведомление
                const morningNotification = notifications.find(
                    (n) => n.data && (n.data as any).type === 'morning_reflection'
                )

                // Проверяем, есть ли вечернее уведомление
                const eveningNotification = notifications.find(
                    (n) => n.data && (n.data as any).type === 'evening_reflection'
                )

                setMorningEnabled(!!morningNotification)
                setEveningEnabled(!!eveningNotification)

                // Если есть уведомления, получаем их время
                if (morningNotification && morningNotification.trigger) {
                    // Получаем время из триггера, если возможно
                    const triggerTime = extractTimeFromTrigger(morningNotification.trigger)
                    if (triggerTime) {
                        setMorningTime(triggerTime.getTime())
                    }
                }

                if (eveningNotification && eveningNotification.trigger) {
                    // Получаем время из триггера, если возможно
                    const triggerTime = extractTimeFromTrigger(eveningNotification.trigger)
                    if (triggerTime) {
                        setEveningTime(triggerTime.getTime())
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при проверке разрешений и уведомлений:', error)
            Alert.alert('Ошибка', 'Не удалось проверить настройки уведомлений')
        } finally {
            setLoading(false)
        }
    }

    // Извлечение времени из триггера уведомления
    const extractTimeFromTrigger = (trigger: any): Date | null => {
        try {
            if (trigger && trigger.seconds) {
                // Если это триггер с секундами, вычисляем время
                const now = new Date()
                const triggerTime = new Date(now.getTime() + trigger.seconds * 1000)
                return triggerTime
            }
            return null
        } catch (error) {
            console.error('Ошибка при извлечении времени из триггера:', error)
            return null
        }
    }

    // Обработка переключения утренних уведомлений
    const handleMorningToggle = async (value: boolean) => {
        try {
            console.log('handleMorningToggle вызван с value:', value)
            setLoading(true)

            if (!hasPermission) {
                const granted = await checkAndRequestNotificationPermissions()
                if (!granted) {
                    Alert.alert(
                        t('notifications.permission_required'),
                        t('notifications.permission_message')
                    )
                    return
                }
                setHasPermission(true)
            }

            if (!value) {
                // Отключаем утренние уведомления
                await dailyNotificationsService.cancelMorningNotification()
                setMorningEnabled(false)
            } else {
                // Включаем утренние уведомления с выбранным временем
                const date = new Date(morningTime)
                await scheduleMorningNotification(date.getHours(), date.getMinutes())
                setMorningEnabled(true)
            }
        } catch (error) {
            console.error('Ошибка при настройке утренних уведомлений:', error)
            Alert.alert(t('notifications.error'), t('notifications.morning_setup_error'))
        } finally {
            setLoading(false)
        }
    }

    // Обработка переключения вечерних уведомлений
    const handleEveningToggle = async (value: boolean) => {
        try {
            console.log('handleEveningToggle вызван с value:', value)
            setLoading(true)

            if (!hasPermission) {
                const granted = await checkAndRequestNotificationPermissions()
                if (!granted) {
                    Alert.alert(
                        t('notifications.permission_required'),
                        t('notifications.permission_message')
                    )
                    return
                }
                setHasPermission(true)
            }

            if (!value) {
                // Отключаем вечерние уведомления
                await dailyNotificationsService.cancelEveningNotification()
                setEveningEnabled(false)
            } else {
                // Включаем вечерние уведомления с выбранным временем
                const date = new Date(eveningTime)
                await scheduleEveningNotification(date.getHours(), date.getMinutes())
                setEveningEnabled(true)
            }
        } catch (error) {
            console.error('Ошибка при настройке вечерних уведомлений:', error)
            Alert.alert(t('notifications.error'), t('notifications.evening_setup_error'))
        } finally {
            setLoading(false)
        }
    }

    // Планирование утреннего уведомления с указанным временем
    const scheduleMorningNotification = async (hours: number, minutes: number) => {
        // Отменяем предыдущее утреннее уведомление
        await dailyNotificationsService.cancelMorningNotification()

        // Создаем новое уведомление с указанным временем
        const notification = {
            title: t('notifications.morning_title'),
            body: t('notifications.morning_body'),
            data: { type: 'morning_reflection', screen: 'StartYourDay' },
            trigger: {
                channelId: 'default',
                seconds: calculateSecondsUntilTime(hours, minutes),
                repeats: true,
            }
        }

        await notificationsService.scheduleLocalNotification(notification)

        // Обновляем состояние времени
        const newTime = new Date()
        newTime.setHours(hours, minutes, 0, 0)
        setMorningTime(newTime.getTime())
    }

    // Планирование вечернего уведомления с указанным временем
    const scheduleEveningNotification = async (hours: number, minutes: number) => {
        // Отменяем предыдущее вечернее уведомление
        await dailyNotificationsService.cancelEveningNotification()

        // Создаем новое уведомление с указанным временем
        const notification = {
            title: t('notifications.evening_title'),
            body: t('notifications.evening_body'),
            data: { type: 'evening_reflection', screen: 'EveningReflection' },
            trigger: {
                channelId: 'default',
                seconds: calculateSecondsUntilTime(hours, minutes),
                repeats: true,
            }
        }

        await notificationsService.scheduleLocalNotification(notification)

        // Обновляем состояние времени
        const newTime = new Date()
        newTime.setHours(hours, minutes, 0, 0)
        setEveningTime(newTime.getTime())
    }

    // Вычисление секунд до указанного времени
    const calculateSecondsUntilTime = (hours: number, minutes: number): number => {
        const now = new Date()
        const targetTime = new Date(now.getTime())
        targetTime.setHours(hours, minutes, 0, 0)

        // Если целевое время уже прошло сегодня, устанавливаем на завтра
        if (targetTime <= now) {
            targetTime.setDate(targetTime.getDate() + 1)
        }

        return Math.floor((targetTime.getTime() - now.getTime()) / 1000)
    }

    // Обработчик изменения времени утреннего уведомления
    const handleMorningTimeChange = (selectedDate: Date) => {
        setMorningTime(selectedDate.getTime())

        // Если уведомления включены, обновляем их
        if (morningEnabled) {
            scheduleMorningNotification(selectedDate.getHours(), selectedDate.getMinutes())
        }
    }

    // Обработчик изменения времени вечернего уведомления
    const handleEveningTimeChange = (selectedDate: Date) => {
        setEveningTime(selectedDate.getTime())

        // Если уведомления включены, обновляем их
        if (eveningEnabled) {
            scheduleEveningNotification(selectedDate.getHours(), selectedDate.getMinutes())
        }
    }

    return (
        <View>
            {/* Утренние уведомления */}
            <View className="mb-8 rounded-xl overflow-hidden bg-surface-paper dark:bg-surface-paper-dark">
                <Text
                    variant="secondary"
                    size="sm"
                    className="uppercase mb-4 px-4 pt-4"
                >
                    {t('settings.notifications.morning_reminder')}
                </Text>

                <Switch
                    value="morning_enabled"
                    label={t('settings.notifications.morning_reminder')}
                    checked={morningEnabled}
                    onChange={handleMorningToggle}
                />

                <View className="h-[1px] bg-inactive/20 mx-4" />

                <TimePicker
                    time={new Date(morningTime)}
                    onChange={handleMorningTimeChange}
                    className='py-2 px-4'
                />
            </View>

            {/* Вечерние уведомления */}
            <View className="mb-8 rounded-xl overflow-hidden bg-surface-paper dark:bg-surface-paper-dark">
                <Text
                    variant="secondary"
                    size="sm"
                    className="uppercase mb-4 px-4 pt-4"
                >
                    {t('settings.notifications.evening_reminder')}
                </Text>

                <Switch
                    value="evening_enabled"
                    label={t('settings.notifications.evening_reminder')}
                    checked={eveningEnabled}
                    onChange={handleEveningToggle}
                />

                <View className="h-[1px] bg-inactive/20 mx-4" />

                <TimePicker
                    time={new Date(eveningTime)}
                    onChange={handleEveningTimeChange}
                    className='py-2 px-4'
                />
            </View>

            {/* Запрос разрешений */}
            {!hasPermission && (
                <Button
                    onPress={checkAndRequestNotificationPermissions}
                    disabled={loading}
                    variant='secondary'
                >
                    {t('settings.notifications.allow_notifications')}
                </Button>
            )}
        </View>
    )
}