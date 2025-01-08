// src/shared/hooks/charts/useChartData.ts
import { useMemo } from 'react'

interface ChartDataPoint {
    date: Date
    value: number | null
}

interface WeeklyChartData {
    current: {
        data: number[]
    }
    previous: {
        data: number[]
    }
}

export const useChartData = (currentWeek: ChartDataPoint[], previousWeek: ChartDataPoint[]): WeeklyChartData => {
    return useMemo(() => {
        const processWeek = (data: ChartDataPoint[]) => {
            const weekData = Array(7).fill(0)
            let sum = 0
            let count = 0
            
            data.forEach(point => {
                if (point.value !== null) {
                    const dayIndex = point.date.getDay() === 0 ? 6 : point.date.getDay() - 1
                    weekData[dayIndex] = point.value
                    sum += point.value
                    count++
                }
            })

            return {
                data: weekData
            }
        }

        const current = processWeek(currentWeek)
        const previous = processWeek(previousWeek)

        return {
            current,
            previous
        }
    }, [currentWeek, previousWeek])
}