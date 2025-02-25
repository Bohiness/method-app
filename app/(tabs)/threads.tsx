import { MonthlyActivity } from '@features/charts/MonthlyActivity'
import { WeeklyChart } from '@features/charts/WeeklyChart'
import { CheckConnect } from '@features/system/CheckConnect'
import { useChartData } from '@shared/hooks/charts/useChartData'
import { useMoodStats } from '@shared/hooks/diary/mood/useMoodStats'
import { Text } from '@shared/ui/text'
import { Container } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

export default function ThreadsScreen() {
    const { t } = useTranslation()
    const { weeklyData, isPending, monthlyData } = useMoodStats()
    const chartData = useChartData(weeklyData.current, weeklyData.previous)

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
                            <WeeklyChart
                                currentWeekData={chartData.current.data}
                                previousWeekData={chartData.previous.data}
                                currentAvg={weeklyData.currentAvg}
                                previousAvg={weeklyData.previousAvg}
                                isLoading={isPending}
                            />
                            <MonthlyActivity currentMonthData={monthlyData} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Container>
    )
}