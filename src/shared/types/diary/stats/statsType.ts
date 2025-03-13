
// Базовый тип для данных о настроении
interface MoodDataPoint {
 date: string
 avg_mood: number
 count: number
}

// Типы для недельной статистики
export interface WeeklyStatsResponse {
 current_week: MoodDataPoint[]
 previous_week: MoodDataPoint[]
 current_week_avg: number
 previous_week_avg: number
}

// Типы для месячной статистики
export interface MonthlyStatsResponse {
 current_month: MoodDataPoint[]
 previous_month: MoodDataPoint[]
 current_month_avg: number
 previous_month_avg: number
}

// Тип для обработанных данных
interface ProcessedDataPoint {
 date: Date
 value: number
 count: number
}

export interface ProcessedMoodStats {
 monthlyData: {
   current: ProcessedDataPoint[]
   previous: ProcessedDataPoint[]
   currentAvg: number
   previousAvg: number
 }
 weeklyData: {
   current: ProcessedDataPoint[]
   previous: ProcessedDataPoint[]
   currentAvg: number
   previousAvg: number
 }
 rawData: {
   monthly: MonthlyStatsResponse | undefined
   weekly: WeeklyStatsResponse | undefined
 }
 isPending: boolean
}