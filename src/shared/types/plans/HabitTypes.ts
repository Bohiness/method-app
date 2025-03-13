// Типы для работы с привычками

// Тип для создания новой привычки
export type CreateHabitDtoType = {
    title: string;
    color?: string;
    icon?: string;
    daily_target?: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    custom_interval_days?: number;
};

// Тип для обновления привычки — все поля опциональны
export type UpdateHabitDtoType = Partial<CreateHabitDtoType>;

// Тип для фильтров при запросе привычек
export type HabitFiltersType = {
    title?: string;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
    is_closed?: boolean;
};

// Полная модель привычки (если потребуется для описания данных, получаемых с сервера)
export interface HabitType {
    id: number;
    title: string;
    color?: string;
    icon?: string;
    daily_target: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    custom_interval_days?: number;
    total_completions: number;
    average_ease_rating: number;
    current_streak: number;
    is_closed: boolean;
    closed_at?: string;
    created_at: string;
    updated_at: string;
}
