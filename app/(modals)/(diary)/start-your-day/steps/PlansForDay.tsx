import { BottomButton } from '@entities/modals/bottom-button'
import { UniversalScreen } from '@features/screens/UniversalScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StartYourDayStackParamList } from '../StepNavigator'

type PlansForDayProps = NativeStackScreenProps<StartYourDayStackParamList, 'PlansForDay'>

export function PlansForDay({ route, navigation }: PlansForDayProps) {
    const { t } = useTranslation()
    const [screen4Response, setScreen4Response] = useState('')
    const { date, sleepQuality, factors } = route.params

    const onComplete = () => {
        navigation.navigate('SuccessStepStartYourDay', {
            date,
            planForDay: screen4Response,
            factors,
            sleepQuality
        })

    }

    return (
        <View className="flex-1" variant='default'>
            <View className="flex-1">
                <UniversalScreen
                    topContent={
                        <>
                            <Title align='center' className='mb-2'>{t('diary.startday.plansForDay.title')}</Title>
                            <Text align='center' className='mb-4'>{t('diary.startday.plansForDay.description')}</Text>
                        </>
                    }
                    inputValue={screen4Response}
                    onInputChange={setScreen4Response}
                    placeholder={t('diary.startday.plansForDay.placeholder')}
                />

            </View>

            <BottomButton
                onNext={onComplete}
                onBack={() => navigation.goBack()}
                enabledNextButton={true}
                canSkip={false}
                canBack={false}
                showButtonBlock={true}
            />
        </View>
    )
}   