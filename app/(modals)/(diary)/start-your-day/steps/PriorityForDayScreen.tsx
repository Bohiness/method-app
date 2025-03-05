import { BottomButton } from '@entities/modals/bottom-button'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { FactorsScrollView } from '@widgets/diary/factors/FactorsScrollView'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StartYourDayStackParamList } from '../StepNavigator'

type Props = NativeStackScreenProps<StartYourDayStackParamList, 'PriorityForDay'>

export const PriorityForDayScreen = (
    { route, navigation }: Props
) => {
    const [selectedFactors, setSelectedFactors] = useState<number[]>([])
    const { t } = useTranslation()
    const { date, sleepQuality } = route.params || {}

    const [isNextEnabled, setIsNextEnabled] = useState(false)

    useEffect(() => {
        setIsNextEnabled(selectedFactors.length > 0)
    }, [selectedFactors])

    const handleFactorSelect = (id: number) => {
        setSelectedFactors((prev) =>
            prev.includes(id)
                ? prev.filter(factorId => factorId !== id)
                : [...prev, id]
        )
    }

    const handleNextStep = () => {
        navigation.navigate('PlansForDay', {
            date,
            sleepQuality,
            factors: selectedFactors
        })
    }

    const handleBackStep = () => {
        navigation.goBack()
    }

    return (
        <View className='flex-1'>
            <View className="p-4 flex-1 gap-y-8" variant='default'>
                <Title align='center'>
                    {t('diary.startday.priority.title')}
                </Title>
                <FactorsScrollView
                    selectedFactors={selectedFactors}
                    onSelect={handleFactorSelect}
                    iconView
                />
                <BottomButton
                    onNext={handleNextStep}
                    enabledNextButton={isNextEnabled}
                    canSkip={false}
                    canBack={false}
                    showButtonBlock={true}
                    onBack={handleBackStep}
                />
            </View>
        </View>
    )
}   