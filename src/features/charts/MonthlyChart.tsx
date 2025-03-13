import { useTheme } from "@react-navigation/native"
import { Text } from "@shared/ui/text"
import { LineChart } from "lucide-react-native"
import { useMemo } from "react"
import { Dimensions, View } from "react-native"

interface MonthlyChartProps {
    data: Array<{
        mood_level: number
        created_at: string
    }>
}

export const MonthlyChart = ({ data }: MonthlyChartProps) => {
    const { colors } = useTheme()
    const screenWidth = Dimensions.get('window').width

    // Группируем данные по дням месяца
    const groupedData = useMemo(() => {
        const days = Array(31).fill(0).map((_, i) => i + 1)
        const dataByDay = new Map()

        data.forEach(item => {
            const day = new Date(item.created_at).getDate()
            const values = dataByDay.get(day) || []
            values.push(item.mood_level)
            dataByDay.set(day, values)
        })

        // Считаем среднее значение для каждого дня
        return days.map(day => {
            const values = dataByDay.get(day) || []
            return values.length ?
                values.reduce((sum, val) => sum + val, 0) / values.length :
                null
        })
    }, [data])

    const hasData = data.length > 0
    const currentAvg = hasData ?
        data.reduce((sum, item) => sum + item.mood_level, 0) / data.length :
        0

    const chartConfig = {
        backgroundColor: colors.background,
        backgroundGradientFrom: colors.background,
        backgroundGradientTo: colors.background,
        decimalPlaces: 1,
        color: (opacity = 1) => colors.tint,
        labelColor: () => colors.secondaryText,
        strokeWidth: 3,
        propsForDots: { r: '3' },
        propsForBackgroundLines: { stroke: colors.inactive },
    }

    const chartData = {
        labels: Array(31).fill(0).map((_, i) => (i + 1).toString()),
        datasets: [
            {
                data: groupedData,
                color: (opacity = 1) => colors.tint,
                strokeWidth: 2,
                withDots: true
            },
            {
                data: Array(31).fill(currentAvg),
                color: () => `rgba(128, 128, 128, 0.4)`,
                strokeWidth: 1,
                withDots: false,
                strokeDasharray: [5, 5]
            }
        ]
    }

    return (
        <View>
            <Text className="text-base font-semibold mb-4 text-secondary dark:text-secondary-dark text-center">
                {hasData ? `Monthly Average: ${currentAvg.toFixed(1)}` : 'No data available'}
            </Text>
            <LineChart
                data={chartData}
                height={220}
                bezier
                withShadow={false}
                segments={5}
                fromZero
                width={screenWidth + 90}
                chartConfig={chartConfig}
                withInnerLines={true}
                withVerticalLines={false}
                yAxisInterval={1}
                style={{
                    marginHorizontal: -50,
                }}
            />
        </View>
    )
}