import { BottomButton } from '@entities/modals/bottom-button'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from '@shared/ui/view'
import { SleepQualityStep } from '@widgets/diary/start-day/screens/SleepQualityStep'
import { useState } from 'react'
import { StartYourDayStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<StartYourDayStackParamList, 'SleepQualityStep'>

export const SleepQualityStepScreen = (
    { route, navigation }: Props
) => {
    const { date } = route.params
    const [screen1Response, setScreen1Response] = useState(50)

    return (
        <View className="flex-1" variant='default'>
            <SleepQualityStep
                initialValue={screen1Response}
                onChange={(value) => setScreen1Response(value)}
            />
            <BottomButton
                onNext={() => navigation.navigate('PriorityForDay', { date, sleepQuality: screen1Response })}
                enabledNextButton={true}
                canSkip={false}
                canBack={false}
                showButtonBlock={true}
                onBack={() => navigation.goBack()}
            />
        </View>
    )
}