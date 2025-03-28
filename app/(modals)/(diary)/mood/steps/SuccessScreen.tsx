import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FinishButton } from '@shared/ui/button'
import { View } from '@shared/ui/view'
import { SuccessStep } from '@widgets/diary/mood/steps/SuccessStep'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
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
        <View className="flex-1" variant='default'>
            <View className="flex-1">
                <SuccessStep />
            </View>
            <View className="px-4 items-center">
                <FinishButton
                    variant="default"
                    onPress={handleClose}
                >
                    {t('common.done')}
                </FinishButton>
            </View>
        </View>
    )
}

export default SuccessScreen 