//src/features/onboarding/screens/NotificationsScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker'
import { useNotification } from '@shared/context/notification-provider'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { Button } from '@shared/ui/button'
import { NotificationsContainer } from '@shared/ui/notifications/notification'
import { Separator } from '@shared/ui/separator'
import { Switch } from '@shared/ui/switch'
import { Text } from '@shared/ui/text'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'

export const NotificationsScreen = () => {
    const { t } = useTranslation()
    const { locale, hour12 } = useLocale()
    const { setNextScreen, updateOnboardingData } = useOnboarding()
    const {
        settings,
        updateSettings,
        scheduleLocalNotification,
        cancelAllNotifications,
        registerForPushNotifications
    } = useNotification()

    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [morningTime, setMorningTime] = useState(new Date().setHours(8, 0))
    const [eveningTime, setEveningTime] = useState(new Date().setHours(22, 0))
    const [morningEnabled, setMorningEnabled] = useState(true)
    const [eveningEnabled, setEveningEnabled] = useState(true)

    const notifications = [
        {
            id: '1',
            title: 'Method.do',
            description: t('screens.onboarding.notifications.alert_description'),
            time: new Date(morningTime),
        },
        {
            id: '2',
            title: 'Title 2',
            description: t('screens.onboarding.notifications.alert_description'),
            time: new Date(eveningTime),
        },
    ]

    const handleTimeChange = (event: any, selectedDate: Date | undefined, isMorning: boolean) => {
        if (!selectedDate) return

        if (isMorning) {
            setMorningTime(selectedDate.getTime())
            if (morningEnabled) {
                updateNotificationSchedule(selectedDate, true)
            }
        } else {
            setEveningTime(selectedDate.getTime())
            if (eveningEnabled) {
                updateNotificationSchedule(selectedDate, false)
            }
        }
    }


    const updateNotificationSchedule = async (time: Date, isMorning: boolean) => {
        try {
            // Теперь проверяем наличие разрешений перед планированием
            if (!settings?.push_enabled) {
                return
            }

            await scheduleLocalNotification({
                title: isMorning ? t('notifications.morning.title') : t('notifications.evening.title'),
                body: isMorning ? t('notifications.morning.body') : t('notifications.evening.body'),
                trigger: {
                    hour: time.getHours(),
                    minute: time.getMinutes(),
                    repeats: true,
                    type: 'time'
                }
            })
        } catch (error) {
            console.error('Ошибка в updateNotificationSchedule:', error)
        }
    }

    const handleCheckboxChange = async (value: boolean, isMorning: boolean) => {
        if (isMorning) {
            setMorningEnabled(value)
            if (value) {
                await updateNotificationSchedule(new Date(morningTime), true)
            }
        } else {
            setEveningEnabled(value)
            if (value) {
                await updateNotificationSchedule(new Date(eveningTime), false)
            }
        }
    }



    const handleNotifications = async () => {
        setLoading(true)
        try {
            // Сначала запрашиваем разрешение на уведомления
            await registerForPushNotifications()

            // После получения разрешения настраиваем уведомления
            await cancelAllNotifications()

            await updateSettings({
                push_enabled: true,
                sound_enabled: true,
                categories_preferences: {
                    daily_reminders: true
                }
            })

            // Планируем новые уведомления если они включены
            if (morningEnabled) {
                await updateNotificationSchedule(new Date(morningTime), true)
            }
            if (eveningEnabled) {
                await updateNotificationSchedule(new Date(eveningTime), false)
            }

            // Сохраняем настройки в онбординге
            updateOnboardingData({
                notifications: {
                    morning: {
                        enabled: morningEnabled,
                        time: morningTime,
                    },
                    evening: {
                        enabled: eveningEnabled,
                        time: eveningTime,
                    },
                },
            })

            setNextScreen()
        } catch (error) {
            console.error('Ошибка при настройке уведомлений:', error)
            // Если пользователь отказал в разрешении или произошла ошибка
            setNextScreen() // Пропускаем настройку уведомлений при ошибке
        } finally {
            setLoading(false)
        }
    }

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            // Если пользователь не завершил онбординг, отменяем уведомления
            if (!settings?.push_enabled) {
                cancelAllNotifications()
            }
        }
    }, [])

    return (
        <View className="flex-1" style={{ paddingTop: insets.top }}>
            <View className="flex-1 items-center justify-start p-4 pt-20">
                <View className="w-full max-w-sm">
                    <Text size="2xl" weight="bold" className="text-center mb-6">
                        {t('screens.onboarding.notifications.title')}
                    </Text>

                    <View style={{ height: notifications.length * 16 + 100 }} className="relative w-full">
                        <NotificationsContainer notifications={notifications} />
                    </View>

                    <Text size="lg" variant="secondary" className="text-center mb-6">
                        {t('screens.onboarding.notifications.subtitle')}
                    </Text>

                    <View className="bg-background dark:bg-background-dark rounded-2xl p-6 mb-8 w-full gap-4">
                        {/* Утреннее время */}
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 -ml-3">
                                <Text size="lg" weight="bold" className="mb-1 ml-3">
                                    {t('screens.onboarding.notifications.morning')}
                                </Text>
                                <DateTimePicker
                                    value={new Date(morningTime)}
                                    mode="time"
                                    is24Hour={!hour12}
                                    display="default"
                                    locale={locale}
                                    onChange={(event, date) => handleTimeChange(event, date, true)}
                                />
                            </View>
                            <Switch
                                checked={morningEnabled}
                                onChange={(value) => handleCheckboxChange(value, true)}
                                value="morning"
                            />
                        </View>

                        <Separator />

                        {/* Вечернее время */}
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 -ml-3">
                                <Text size="lg" weight="bold" className="mb-1 ml-3">
                                    {t('screens.onboarding.notifications.evening')}
                                </Text>
                                <DateTimePicker
                                    value={new Date(eveningTime)}
                                    mode="time"
                                    is24Hour={!hour12}
                                    display="default"
                                    locale={locale}
                                    onChange={(event, date) => handleTimeChange(event, date, false)}
                                />
                            </View>
                            <Switch
                                checked={eveningEnabled}
                                onChange={(value) => handleCheckboxChange(value, false)}
                                value="evening"
                            />
                        </View>
                    </View>

                    <Text size="sm" variant="secondary" className="text-center mb-4">
                        {t('screens.onboarding.notifications.smart_system')}
                    </Text>
                </View>
            </View>

            <View className="p-4 pb-8">
                <Button
                    onPress={handleNotifications}
                    className="w-full"
                    size="lg"
                    loading={loading}
                >
                    {t('common.allow')}
                </Button>
            </View>
        </View>
    )
}