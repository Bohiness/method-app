import { BottomButton } from '@entities/modals/bottom-button'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from '@shared/ui/view'
import { HowIsYourDay } from '@widgets/diary/evening-reflection/screens/HowIsYourDay'
import { useState } from 'react'
import { EveningReflectionStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<EveningReflectionStackParamList, 'HowIsYourDay'>


export default function HowIsYourDayScreen(
    { route, navigation }: Props
) {
    const { date } = route.params
    const [screen1Response, setScreen1Response] = useState(50)

    return (
        <View className="flex-1" variant='default'>
            <HowIsYourDay
                initialValue={screen1Response}
                onChange={(value) => setScreen1Response(value)}
            />
            <BottomButton
                onNext={() => navigation.navigate('PositiveAspects', { date })}
                enabledNextButton={true}
                canSkip={false}
                canBack={false}
                showButtonBlock={true}
                onBack={() => navigation.goBack()}
            />
        </View>
    )
}