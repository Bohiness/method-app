//src/features/onboarding/screens/NotificationsScreen.tsx
import { useNotification } from '@shared/context/notification-provider'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { dailyNotificationsService } from '@shared/lib/notifications/daily-notifications.service'
import { Button } from '@shared/ui/button'
import { NotificationsContainer } from '@shared/ui/notifications/notification'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'

export const NotificationsScreen = () => {
    const { t } = useTranslation()
    const { locale, hour12 } = useLocale()
    const { setNextScreen, updateOnboardingData } = useOnboarding()
    const {
        settings,
        updateSettings,
        cancelAllNotifications,
        registerForPushNotifications
    } = useNotification()

    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [morningTime, setMorningTime] = useState(new Date().setHours(8, 0))
    const [eveningTime, setEveningTime] = useState(new Date().setHours(22, 0))
    const [morningEnabled, setMorningEnabled] = useState(true)

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


    const updateNotificationSchedule = async (time: Date, isMorning: boolean) => {
        try {
            // Проверяем наличие разрешений перед планированием
            if (!settings?.push_enabled) {
                return
            }

            // Используем dailyNotificationsService для настройки ежедневных уведомлений с пользовательским временем
            if (isMorning) {
                // Устанавливаем настраиваемое время утреннего уведомления
                await dailyNotificationsService.scheduleMorningNotification(
                    time.getHours(),
                    time.getMinutes()
                )
            } else {
                // Устанавливаем настраиваемое время вечернего уведомления
                await dailyNotificationsService.scheduleEveningNotification(
                    time.getHours(),
                    time.getMinutes()
                )
            }
        } catch (error) {
            console.error('Ошибка в updateNotificationSchedule:', error)
        }
    }

    const handleNotifications = async () => {
        setLoading(true)
        try {
            // Сначала запрашиваем разрешение на уведомления
            await registerForPushNotifications()

            // После получения разрешения настраиваем уведомления
            await dailyNotificationsService.cancelAllDailyNotifications()

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

    // Синхронизация времени в сервисе и наших настройках при инициализации
    useEffect(() => {
        // Устанавливаем сохраненное время для утренних уведомлений
        const morningDate = new Date(morningTime)
        dailyNotificationsService.setMorningTime(morningDate.getHours(), morningDate.getMinutes())

        // Устанавливаем сохраненное время для вечерних уведомлений
        const eveningDate = new Date(eveningTime)
        dailyNotificationsService.setEveningTime(eveningDate.getHours(), eveningDate.getMinutes())
    }, [])

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            // Если пользователь не завершил онбординг, отменяем уведомления
            if (!settings?.push_enabled) {
                dailyNotificationsService.cancelAllDailyNotifications()
            }
        }
    }, [])

    return (
        <View className="flex-1 justify-center" style={{ paddingTop: insets.top }}>
            <View className="flex-1 items-center justify-center">
                <View className="w-full max-w-sm">
                    <Text size="2xl" weight="bold" className="text-center mb-10">
                        {t('screens.onboarding.notifications.title')}
                    </Text>

                    <View style={{ height: notifications.length * 16 + 100 }} className="relative w-full mb-2">
                        <NotificationsContainer notifications={notifications} />
                    </View>

                    <Text size="lg" variant="secondary" className="text-center">
                        {t('screens.onboarding.notifications.productivity_system')}
                    </Text>
                </View>
            </View>

            <Animated.View
                className="px-6 pb-10"
                entering={FadeIn.delay(400).duration(800)}
            >
                <Button
                    onPress={handleNotifications}
                    className="w-fit self-center px-20"
                    size='lg'
                    loading={loading}
                >
                    {t('common.allow')}
                </Button>
            </Animated.View>
        </View>
    )
}