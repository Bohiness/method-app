// src/features/onboarding/screens/NotificationsScreen.tsx
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { Button } from '@shared/ui/button'
import { Checkbox } from '@shared/ui/checkbox-radio'
import { NotificationsContainer } from '@shared/ui/notifications/notification'
import { Separator } from '@shared/ui/separator'
import { Text } from '@shared/ui/text'
import * as Notifications from 'expo-notifications'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboarding } from '../context/OnboardingContext'

export const NotificationsScreen = () => {
    const { t } = useTranslation()
    const { locale, hour12 } = useLocale()
    const { setNextScreen, updateOnboardingData } = useOnboarding()
    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [morningTime, setMorningTime] = useState(new Date().setHours(8, 0))
    const [eveningTime, setEveningTime] = useState(new Date().setHours(22, 0))
    const [showMorningPicker, setShowMorningPicker] = useState(false)
    const [showEveningPicker, setShowEveningPicker] = useState(false)
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
        if (Platform.OS === 'android') {
            setShowMorningPicker(false)
            setShowEveningPicker(false)
        }

        if (selectedDate) {
            if (isMorning) {
                setMorningTime(selectedDate.getTime())
            } else {
                setEveningTime(selectedDate.getTime())
            }
        }
    }

    const handleNotifications = async () => {
        setLoading(true)
        try {
            const { status } = await Notifications.requestPermissionsAsync()
            if (status === 'granted') {
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
            }
        } finally {
            setLoading(false)
        }
    }

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
                            <Checkbox
                                checked={morningEnabled}
                                onChange={setMorningEnabled}
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
                            <Checkbox
                                checked={eveningEnabled}
                                onChange={setEveningEnabled}
                                value="evening"
                            />
                        </View>
                    </View>

                    <Text size="sm" variant="secondary" className="text-center mb-4">
                        {t('screens.onboarding.notifications.smart_system')}
                    </Text>
                </View>
            </View>

            {/* Кнопка внизу экрана */}
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