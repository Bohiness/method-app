import { MonthlyActivity } from '@features/charts/MonthlyActivity'
import { WeeklyChart } from '@features/charts/WeeklyChart'
import { CheckConnect } from '@features/system/CheckConnect'
import { useMoodCheckinStats } from '@shared/hooks/diary/mood/useMoodCheckin'
import { useCalendarWeekMoodConverter } from '@shared/hooks/diary/stats/useStatsMoodCheckinConverter'
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'

export default function ThreadsScreen() {
    const { t } = useTranslation()
    const { wrapWithSubscriptionOverlay } = useSubscriptionModal()

    // Используем конвертер для получения данных по календарным неделям (пн-вс)
    const {
        currentPeriodData: weeklyData,
        previousPeriodData: prevWeeklyData,
        currentAvg: weeklyAvg,
        previousAvg: prevWeeklyAvg,
        isLoading: isWeeklyLoading
    } = useCalendarWeekMoodConverter()

    // Используем конвертер для получения месячных данных
    const {
        currentPeriodData: monthlyData,
        isLoading: isMonthlyLoading
    } = useMoodCheckinStats(30)

    return (
        <View variant="default" className="flex-1">
            <CheckConnect />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="flex-1 gap-y-6 pb-10">
                    <View>
                        <Text className='text-center' variant="secondary">
                            {t('threads.description')}
                        </Text>
                    </View>

                    <View className="flex-1 gap-y-6">
                        <WeeklyChart
                            currentWeekData={weeklyData}
                            previousWeekData={prevWeeklyData}
                            currentAvg={weeklyAvg || 0}
                            previousAvg={prevWeeklyAvg || 0}
                            isLoading={isWeeklyLoading}
                        />

                        {wrapWithSubscriptionOverlay({
                            plan: 'premium',
                            children: <MonthlyActivity currentMonthData={monthlyData} />
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}