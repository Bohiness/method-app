import { useTheme } from '@shared/context/theme-provider'
import { hexToRgb } from '@shared/lib/utils/hexToRgb'
import { Text } from '@shared/ui/text'
import React, { useEffect, useState } from 'react'
import { Dimensions, View } from 'react-native'
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
    const { colors } = useTheme()
    const screenWidth = Dimensions.get('window').width
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

    // Состояния для данных графика
    const [chartData, setChartData] = useState({
        labels,
        datasets: [
            {
                data: currentWeekData,
                color: (): string => `rgba(${hexToRgb(colors.text)}, 1)`,
                strokeWidth: 4,
                withDots: false
            },
            {
                data: previousWeekData,
                color: (): string => `rgba(${hexToRgb(colors.text)}, 0.6)`,
                strokeWidth: 4,
                withDots: false
            },
            {
                data: Array(7).fill(currentAvg),
                color: (): string => `rgba(128, 128, 128, 0.4)`,
                strokeWidth: 1,
                withDots: false,
                strokeDasharray: [5, 5]
            }
        ],
        legend: ["This week", "Previous week", "Average"]
    })

    // Состояние для среднего значения
    const [average, setAverage] = useState(currentAvg)

    const hasData = currentWeekData.some(v => v > 0) || previousWeekData.some(v => v > 0)

    useEffect(() => {
        // Обновляем данные графика при изменении входных данных
        setChartData({
            labels,
            datasets: [
                {
                    data: currentWeekData,
                    color: (): string => `rgba(${hexToRgb(colors.text)}, 1)`,
                    strokeWidth: 4,
                    withDots: false
                },
                {
                    data: previousWeekData,
                    color: (): string => `rgba(${hexToRgb(colors.text)}, 0.6)`,
                    strokeWidth: 4,
                    withDots: false
                },
                {
                    data: Array(7).fill(currentAvg),
                    color: (): string => `rgba(128, 128, 128, 0.4)`,
                    strokeWidth: 1,
                    withDots: false,
                    strokeDasharray: [5, 5]
                }
            ],
            legend: ["This week", "Previous week", "Average"]
        })
        setAverage(currentAvg)
    }, [currentWeekData, previousWeekData, currentAvg, colors])

    const chartConfig = {
        backgroundColor: colors.background,
        backgroundGradientFrom: colors.background,
        backgroundGradientTo: colors.background,
        decimalPlaces: 1,
        color: (opacity = 1) => colors.text,
        labelColor: () => colors.secondary.light,
        propsForDots: { r: '0' },
        propsForBackgroundLines: { stroke: 'false' },
        fromZero: true,
        formatYLabel: (value: string) => Number(value).toFixed(1),
        yMin: 0,
        yMax: 5
    }

    return (
        <View>
            <Text className={`
                text-center text-base font-semibold mb-2
                text-secondary/60 dark:text-secondary-dark/60
            `}>
                {hasData ? `Average: ${average.toFixed(1)}` : 'No data available'}
            </Text>

            <LineChart
                data={chartData}
                height={170}
                bezier
                withShadow={false}
                withDots={false}
                segments={7}
                withHorizontalLabels={false}
                fromZero
                width={screenWidth + 90}
                chartConfig={chartConfig}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={false}
                yAxisInterval={1}
                decorator={() => null}
                style={{
                    marginHorizontal: -50,
                }}
            />
        </View>
    )
}