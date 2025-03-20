//src/features/onboarding/screens/NotificationsScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker'
import { useNotification } from '@shared/context/notification-provider'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { dailyNotificationsService } from '@shared/lib/notifications/daily-notifications.service'
import { Button } from '@shared/ui/button'
import { Separator } from '@shared/ui/separator'
import { Switch } from '@shared/ui/switch'
import { Text } from '@shared/ui/text'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'

export const NotificationsScreen2 = () => {
    const { t } = useTranslation()
    const { locale, hour12 } = useLocale()
    const { setNextScreen, setPreviousScreen, updateOnboardingData } = useOnboarding()
    const {
        settings,
        updateSettings,
        cancelAllNotifications,
        registerForPushNotifications,
        checkActualPermissions
    } = useNotification()

    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [morningTime, setMorningTime] = useState(new Date().setHours(9, 0))
    const [eveningTime, setEveningTime] = useState(new Date().setHours(21, 0))
    const [morningEnabled, setMorningEnabled] = useState(true)
    const [eveningEnabled, setEveningEnabled] = useState(true)
    const [showError, setShowError] = useState(false)
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(true)

    // Проверяем, включены ли уведомления при первом рендере компонента
    useEffect(() => {
        const checkNotificationsPermission = async () => {
            setIsCheckingPermissions(true)
            try {
                // Проверяем актуальное состояние системных разрешений
                const isEnabled = await checkActualPermissions()

                // Показываем ошибку только если разрешения нет
                if (!isEnabled) {
                    setShowError(true)
                } else if (showError) {
                    // Убираем ошибку, если она отображалась, но разрешения теперь есть
                    setShowError(false)
                }
            } catch (error) {
                console.error('Ошибка при проверке разрешений:', error)
                setShowError(true)
            } finally {
                setIsCheckingPermissions(false)
            }
        }

        checkNotificationsPermission()
    }, [settings]) // Выполняем проверку при изменении настроек

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
            // Проверяем актуальное состояние разрешений перед планированием
            const isEnabled = await checkActualPermissions()

            // Проверяем наличие разрешений перед планированием
            if (!isEnabled) {
                setShowError(true)
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

    const handleCheckboxChange = async (value: boolean, isMorning: boolean) => {
        if (isMorning) {
            setMorningEnabled(value)
            if (value) {
                await updateNotificationSchedule(new Date(morningTime), true)
            } else {
                // Если уведомление отключено, отменяем его
                await dailyNotificationsService.cancelMorningNotification()
            }
        } else {
            setEveningEnabled(value)
            if (value) {
                await updateNotificationSchedule(new Date(eveningTime), false)
            } else {
                // Если уведомление отключено, отменяем его
                await dailyNotificationsService.cancelEveningNotification()
            }
        }
    }

    const handleNotifications = async () => {
        setLoading(true)
        try {
            // Сначала запрашиваем разрешение на уведомления
            await registerForPushNotifications()

            // Проверяем, действительно ли получили разрешение
            const isEnabled = await checkActualPermissions()
            if (!isEnabled) {
                throw new Error('Не удалось получить разрешение на уведомления')
            }

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

            setShowError(false)
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
            checkActualPermissions().then(isEnabled => {
                if (!isEnabled) {
                    dailyNotificationsService.cancelAllDailyNotifications()
                }
            })
        }
    }, [])

    // Показываем индикатор загрузки, пока проверяем разрешения
    if (isCheckingPermissions) {
        return (
            <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top }}>
                <Text className="text-center mb-4">
                    {t('screens.onboarding.notifications2.checking_permissions')}
                </Text>
            </View>
        )
    }

    return (
        <View className="flex-1" style={{ paddingTop: insets.top }}>
            {showError && (
                <View className="bg-red-100 dark:bg-red-900 p-4 mb-4 mx-4 rounded-lg">
                    <Text className="text-red-600 dark:text-red-300 text-center mb-2" weight="bold">
                        {t('screens.onboarding.notifications2.error.title')}
                    </Text>
                    <Text className="text-red-600 dark:text-red-300 text-center mb-3">
                        {t('screens.onboarding.notifications2.error.message')}
                    </Text>
                    <View className="flex-row gap-2">
                        <Button
                            variant="outline"
                            onPress={setPreviousScreen}
                            className="flex-1"
                        >
                            {t('common.back')}
                        </Button>
                        <Button
                            variant="destructive"
                            onPress={setNextScreen}
                            className="flex-1"
                        >
                            {t('common.skip')}
                        </Button>
                    </View>
                </View>
            )}

            <View className="flex-1 items-center justify-center">
                <View className="w-full max-w-sm">
                    <Text size="2xl" weight="bold" className="text-center mb-10">
                        {t('screens.onboarding.notifications2.subtitle')}
                    </Text>


                    <View className="bg-background dark:bg-background-dark rounded-2xl p-6 mb-10 w-full gap-4">
                        {/* Утреннее время */}
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 -ml-3">
                                <Text size="lg" weight="bold" className="mb-1 ml-3">
                                    {t('screens.onboarding.notifications2.morning')}
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
                                    {t('screens.onboarding.notifications2.evening')}
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

                    <Text variant="secondary" className="text-center mb-4">
                        {t('screens.onboarding.notifications2.smart_system')}
                    </Text>
                </View>
            </View>

            <View className="p-4 pb-10">
                <Button
                    onPress={handleNotifications}
                    className="w-fit self-center px-20"
                    size="lg"
                    loading={loading}
                >
                    {t('common.continue')}
                </Button>
            </View>
        </View>
    )
}