// app/(coach)/booking.tsx
import { DateScrollPicker } from '@entities/calendar/date-scroll-picker'
import { useCoach, usePackages } from '@shared/hooks/coaches/useCoach'
import { Button } from '@shared/ui/button'
import { Icon } from '@shared/ui/icon'
import { Select } from '@shared/ui/select'
import { Text } from '@shared/ui/text'
import { Container, View } from '@shared/ui/view'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function BookingScreen() {
    const { coachID, date } = useLocalSearchParams()
    const { coach } = useCoach(+coachID)
    const { packages } = usePackages(+coachID)
    const { t } = useTranslation()
    const [selectedPackage, setSelectedPackage] = useState('')
    const insets = useSafeAreaInsets()

    console.log(' ------- BookingScreen ------- coachID', coachID)

    // Используем переданную дату или текущую
    const [selectedDate, setSelectedDate] = useState(() =>
        date ? new Date(date) : new Date()
    )

    if (!coach || !coachID) {
        return null
    }

    if (!packages || packages.length === 0) {
        return (
            <View
                className="flex-1 items-center px-4"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom
                }}
            >
                <View className="self-start">
                    <Button
                        variant="ghost"
                        onPress={() => router.back()}
                        leftIcon="ChevronLeft"
                    />
                </View>

                <View className="mt-8 mb-4">
                    <Icon name="Calendar" size={48} />
                </View>
                <Text
                    size="2xl"
                    weight="bold"
                    className="text-center"
                >
                    {t('coaches.booking.noPackages')}
                </Text>
                <Text
                    variant="secondary"
                    className="text-center mt-2"
                >
                    {t('coaches.booking.noPackagesDescription')}
                </Text>
            </View>
        )
    }

    return (
        <Container style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View>
                <Select
                    options={packages?.map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                    })) || []}
                    value={selectedPackage}
                    onValueChange={() => setSelectedPackage}
                    label={t('booking.selectPackage')}
                />
            </View>
            <DateScrollPicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                daysBack={1}
                daysForward={14}
                scrollToEndEnabled={false}
            />
        </Container>
    )
}