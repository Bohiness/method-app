import { BottomButton } from '@entities/modals/bottom-button'
import { UniversalScreen } from '@features/screens/UniversalScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCreateStartDay } from '@shared/hooks/diary/startday/useStartDay'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StartYourDayStackParamList } from '../StepNavigator'
type PlansForDayProps = NativeStackScreenProps<StartYourDayStackParamList, 'PlansForDay'>

export default function PlansForDay({ route, navigation }: PlansForDayProps) {
    const { t } = useTranslation()
    const [screen4Response, setScreen4Response] = useState('')
    const createMutation = useCreateStartDay()
    const { date, sleepQuality, factors } = route.params

    const onComplete = async () => {
        try {
            // Преобразуем Date в строку формата ISO для API
            const dateString = date.toISOString().split('T')[0]
            const now = new Date().toISOString()

            const startDayData = await createMutation.mutateAsync({
                plans_for_day: screen4Response,
                sleep_quality: sleepQuality,
                priority_for_day: factors,
                date: dateString,
                is_added_to_tasks: false,
                updated_at: now
            })

            navigation.navigate('SuccessStepStartYourDay', {
                date,
                planForDay: screen4Response,
                factors,
                sleepQuality,
                startDayId: startDayData.id
            })
        } catch (error) {
            console.error('Error creating start day:', error)
        }
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