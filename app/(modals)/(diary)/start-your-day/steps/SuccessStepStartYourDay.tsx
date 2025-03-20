import SuccessScreen from '@features/screens/SuccessScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { apiClient } from '@shared/config/api-client'
import { API_ROUTES } from '@shared/constants/api-routes'
import { useUpdateStartDay } from '@shared/hooks/diary/startday/useStartDay'
import { useOfflineTasks } from '@shared/hooks/plans/useOfflineTasks'
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { TaskResponseType } from '@shared/types/plans/TasksTypes'
import { Button } from '@shared/ui/button'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StartYourDayStackParamList } from '../StepNavigator'

// URL для API запроса создания задач

type SuccessStepStartYourDayProps = NativeStackScreenProps<StartYourDayStackParamList, 'SuccessStepStartYourDay'>

export default function SuccessStepStartYourDay({ route }: SuccessStepStartYourDayProps) {
    const { t } = useTranslation()
    const { planForDay, startDayId } = route.params
    const [isLoading, setIsLoading] = useState(false)
    const { syncTasks } = useOfflineTasks()
    const { checkPremiumAIAccess } = useSubscriptionModal()
    const updateStartDay = useUpdateStartDay()

    const handleCreateTasks = async () => {
        if (!planForDay) return

        const hasAccess = await checkPremiumAIAccess({
            text: 'subscription.feature_locked',
        })

        if (!hasAccess) {
            return
        }

        setIsLoading(true)

        try {
            // Отправляем API запрос для создания задач на основе текста
            const response: TaskResponseType = await apiClient.post(API_ROUTES.PLANS.CREATE_TASKS_BY_AI_WITH_TEXT, {
                text: planForDay,
            })

            console.log('response', response)

            if (!response) {
                throw new Error('Failed to create tasks')
            }

            const tasksData = Array.isArray(response) ? response : (response?.tasks || [])

            if (tasksData.length > 0) {
                // Синхронизируем задачи
                syncTasks()

                // Обновляем запись StartDay, установив is_added_to_tasks в true
                if (startDayId) {
                    await updateStartDay.mutateAsync({
                        id: startDayId,
                        data: {
                            is_added_to_tasks: true
                        }
                    })
                }
            }
            // После успешного создания задач закрываем модальное окно
            router.dismissTo('/(tabs)/plans')
        } catch (error) {
            console.error('Error creating tasks:', error)
            setIsLoading(false)
        }
    }

    const bottomContent = useMemo(() => {
        if (planForDay) {
            return (
                <View className="w-full">
                    <View className="rounded-2xl p-6 mb-4" variant='paper'>
                        <Title className="mb-2" align='center'>
                            {t('diary.startday.success.createTasks')}
                        </Title>
                        <Text align='center' className="mb-4">
                            {planForDay}
                        </Text>
                        <View className="flex-row justify-between">
                            <Button
                                variant="outline"
                                className="flex-1 mx-1"
                                onPress={() => router.dismissTo('/(tabs)')}
                            >
                                {t('common.no')}
                            </Button>
                            <Button
                                variant="default"
                                className="flex-1 mx-1"
                                onPress={handleCreateTasks}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {t('common.yes')}
                            </Button>
                        </View>
                    </View>
                </View>
            )
        }
        return null
    }, [planForDay, isLoading, t])

    return (
        <SuccessScreen
            title={t('diary.startday.success.title')}
            description={t('diary.startday.success.description')}
            buttonText={t('common.done')}
            onButtonPress={() => router.dismissTo('/(tabs)')}
            showStreakWidget={false}
            updateStreak={false}
            bottomContent={bottomContent}
            doneButtonActive={!planForDay}
        />
    )
}   