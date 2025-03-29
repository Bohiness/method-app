import { useTheme } from '@shared/context/theme-provider'
import { hexToRgb } from '@shared/lib/utils/hexToRgb'
import { Text } from '@shared/ui/text'
import { View as UIView } from '@shared/ui/view'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import { LineChart } from 'react-native-chart-kit'

interface WeeklyChartProps {
    currentWeekData: number[]
    previousWeekData: number[]
    currentAvg: number
    previousAvg: number
    isLoading?: boolean
}

export const WeeklyChart = ({
    currentWeekData = Array(7).fill(0),
    previousWeekData = Array(7).fill(0),
    currentAvg = 0,
    previousAvg = 0,
    isLoading = false
}: WeeklyChartProps) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const screenWidth = Dimensions.get('window').width
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']


    useEffect(() => {
        console.log(currentWeekData, previousWeekData, currentAvg, previousAvg)
    }, [currentWeekData, previousWeekData, currentAvg, previousAvg])

    useEffect(() => {
        console.log(screenWidth)
    }, [screenWidth])

    // Состояния для данных графика
    const [chartData, setChartData] = useState({
        labels,
        datasets: [
            {
                data: currentWeekData,
                color: (): string => colors.text,
                strokeWidth: 3,
                withDots: false
            },
            {
                data: previousWeekData,
                color: (): string => `rgba(${hexToRgb(colors.secondary.light)}, 0.6)`,
                strokeWidth: 3,
                withDots: false
            },
            {
                data: Array(7).fill(currentAvg),
                color: (): string => `rgba(${hexToRgb(colors.border)}, 0.7)`,
                strokeWidth: 1,
                withDots: false,
                strokeDasharray: [4, 4]
            }
        ],
    })

    // Состояние для среднего значения
    const [average, setAverage] = useState(currentAvg)

    const hasData = currentWeekData.some(v => v > 0) || previousWeekData.some(v => v > 0)

    useLayoutEffect(() => {
        // Обновляем данные графика при изменении входных данных
        setChartData({
            labels,
            datasets: [
                {
                    data: currentWeekData,
                    color: (): string => colors.text,
                    strokeWidth: 3,
                    withDots: false
                },
                {
                    data: previousWeekData,
                    color: (): string => `rgba(${hexToRgb(colors.secondary.light)}, 0.6)`,
                    strokeWidth: 3,
                    withDots: false
                },
                {
                    data: Array(7).fill(currentAvg),
                    color: (): string => `rgba(${hexToRgb(colors.border)}, 0.7)`,
                    strokeWidth: 1,
                    withDots: false,
                    strokeDasharray: [4, 4]
                }
            ],
        })
        setAverage(currentAvg)
    }, [currentWeekData, previousWeekData, currentAvg, colors])

    const chartConfig = {
        backgroundColor: colors.transparent,
        backgroundGradientFrom: colors.transparent,
        backgroundGradientTo: colors.transparent,
        color: (opacity = 1) => `rgba(${hexToRgb(colors.text)}, ${opacity})`,
        labelColor: () => colors.secondary.light,
        propsForDots: { r: '0' },
        propsForBackgroundLines: { strokeWidth: 0 },
        fromZero: true,
        formatYLabel: (value: string) => {
            const num = Number(value)
            return Number.isInteger(num) ? num.toString() : ''
        },
        yAxisLabel: '',
        yAxisSuffix: '',
        yMin: 0,
        yMax: 5,
    }

    return (
        <UIView variant="transparent" className="py-4 rounded-lg">
            <UIView className="flex-row justify-center items-center mb-3 gap-x-4">
                <UIView className="flex-row items-center gap-x-1">
                    <UIView className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.text }} />
                    <Text size="xs" variant="secondary">{t('threads.charts.thisWeek')}</Text>
                </UIView>
                <UIView className="flex-row items-center gap-x-1">
                    <UIView className="w-3 h-3 rounded-full" style={{ backgroundColor: `rgba(${hexToRgb(colors.secondary.light)}, 0.6)` }} />
                    <Text size="xs" variant="secondary">{t('threads.charts.previousWeek')}</Text>
                </UIView>
            </UIView>

            {hasData && (
                <Text className="text-center text-base font-semibold mb-1" variant="secondary">
                    {t('threads.charts.averageLabel', { average: average.toFixed(1) })}
                </Text>
            )}

            <LineChart
                data={chartData}
                width={screenWidth + 120}
                height={170}
                bezier
                withShadow={false}
                withDots={false}
                withHorizontalLabels={false}
                withVerticalLabels={false}
                fromZero={true}
                chartConfig={chartConfig}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={false}
                yAxisInterval={1}
                segments={5}
                style={{
                    marginHorizontal: -60,
                }}
            />
        </UIView>
    )
}