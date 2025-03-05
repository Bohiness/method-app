import { MonthlyActivity } from '@features/charts/MonthlyActivity'
import { WeeklyChart } from '@features/charts/WeeklyChart'
import { CheckConnect } from '@features/system/CheckConnect'
import { useMoodCheckinStats } from '@shared/hooks/diary/mood/useMoodCheckin'
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { Text } from '@shared/ui/text'
import { Container } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

export default function ThreadsScreen() {
    const { t } = useTranslation()
    const { wrapWithSubscriptionOverlay } = useSubscriptionModal()

    const {
        currentPeriodData: weeklyData,
        previousPeriodData: prevWeeklyData,
        currentAvg: weeklyAvg,
        previousAvg: prevWeeklyAvg,
        isLoading: isWeeklyLoading
    } = useMoodCheckinStats(7)

    const {
        currentPeriodData: monthlyData,
        isLoading: isMonthlyLoading
    } = useMoodCheckinStats(30)

    return (
        <Container>
            <View className="flex-1">
                <CheckConnect />
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="flex-1 gap-y-6 pb-10">
                        <View>
                            <Text className='text-center' variant="secondary">
                                {t('threads.description')}
                            </Text>
                        </View>

                        <View className="flex-1 gap-y-6">
                            {wrapWithSubscriptionOverlay({
                                plan: 'premium',
                                children: <WeeklyChart
                                    currentWeekData={weeklyData?.map(item => item.mood_level) || []}
                                    previousWeekData={prevWeeklyData?.map(item => item.mood_level) || []}
                                    currentAvg={weeklyAvg || 0}
                                    previousAvg={prevWeeklyAvg || 0}
                                    isLoading={isWeeklyLoading}
                                />
                            })}

                            {wrapWithSubscriptionOverlay({
                                plan: 'premium',
                                children: <MonthlyActivity currentMonthData={monthlyData} />
                            })}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Container>
    )
}