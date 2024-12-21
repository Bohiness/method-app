import { useModal } from '@shared/context/modal-provider'
import { Text } from '@shared/ui/styled-text'
import { Moon } from 'lucide-react-native'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { MoodCheckin } from './MoodCheckin'

export const EveningReflectionButton = ({ date }: { date: Date }) => {
    const { t } = useTranslation('diary.mood')
    const { showBottomSheet } = useModal()

    const handlePress = useCallback(() => {
        try {
            console.log('Button pressed')
            showBottomSheet(
                <View className="flex-1">
                    <MoodCheckin date={date} />
                </View>
            )
        } catch (error) {
            console.error('Error showing bottom sheet:', error)
        }
    }, [date, showBottomSheet])

    return (
        <Pressable
            onPress={handlePress}
            className="w-max-full overflow-hidden rounded-3xl bg-background p-6 shadow-lg"
        >
            <View className="items-center space-y-4">
                <Moon className="text-text" size={48} />
                <View className="space-y-1">
                    <Text className="text-center text-2xl font-bold text-text">
                        {t('eveningReflection')}
                    </Text>
                    <Text className="text-center text-base text-secondary">
                        {t('sumUpYourDay')}
                    </Text>
                </View>
            </View>
        </Pressable>
    )
}