export type StartDayType = {
    id: string
    user: string
    created_at: string
    updated_at: string
    date: string
    sleep_quality: number
    priority_for_day: number[]
    plans_for_day: string
    is_added_to_tasks: boolean
    is_synced?: boolean
    is_deleted?: boolean
}