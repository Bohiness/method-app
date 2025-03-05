import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '@shared/ui/button'
import { SuccessStep } from '@widgets/diary/mood/steps/SuccessStep'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MoodStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<MoodStackParamList, 'Success'>

export function SuccessScreen({ route }: Props) {
    const insets = useSafeAreaInsets()
    const { t } = useTranslation()

    const handleClose = () => {
        router.dismissTo('/(tabs)')
    }

    return (
        <View className="flex-1 bg-background">
            <View className="flex-1">
                <SuccessStep />
            </View>
            <View className="px-4 items-center">
                <Button
                    variant="default"
                    fullWidth
                    onPress={handleClose}
                    style={{ marginBottom: insets.bottom }}
                >
                    {t('common.done')}
                </Button>
            </View>
        </View>
    )
}

export default SuccessScreen 