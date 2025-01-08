import { MonthlyActivity } from '@features/charts/MonthlyActivity'
import { WeeklyChart } from '@features/charts/WeeklyChart'
import { CheckConnect } from '@features/system/CheckConnect'
import { useChartData } from '@shared/hooks/charts/useChartData'
import { useMoodStats } from '@shared/hooks/diary/mood/useMoodCheckin'
import { Text, Title } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export default function ThreadsScreen() {
    const { t } = useTranslation()
    const { weeklyData, isPending, monthlyData } = useMoodStats()
    const chartData = useChartData(weeklyData.current, weeklyData.previous)

    return (
        <View className="flex-1 bg-background dark:bg-background-dark gap-y-6">
            <CheckConnect />
            <View>
                <Title className='text-center mb-2'>
                    {t('threads.title')}
                </Title>
                <Text className='text-center' variant="secondary">
                    {t('threads.description')}
                </Text>
            </View>
            <WeeklyChart
                currentWeekData={chartData.current.data}
                previousWeekData={chartData.previous.data}
                currentAvg={weeklyData.currentAvg}
                previousAvg={weeklyData.previousAvg}
                isLoading={isPending}
            />
            <MonthlyActivity currentMonthData={monthlyData} />
        </View>
    )
}