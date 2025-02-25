// src/shared/types/notifications/NotificationTypes.ts

export interface DeviceToken {
    id: string;
    token: string;
    platform: string;
    device_id: string;
    app_version?: string;
    device_model?: string;
    device_os?: string;
    device_os_version?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface NotificationSettings {
    push_enabled: boolean;
    email_enabled: boolean;
    sound_enabled: boolean;
    vibration_enabled: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start?: string; // "HH:mm"
    quiet_hours_end?: string; // "HH:mm"
    reminder_frequency?: 'never' | 'daily' | 'weekly' | 'monthly';
    categories_preferences: Record<string, boolean>;
    updated_at: string;
}

export interface NotificationCategory {
    id: string;
    name: string;
    description?: string;
    importance: 'low' | 'normal' | 'high';
    enabled: boolean;
}

export interface NotificationHistory {
    id: string;
    title: string;
    body: string;
    category?: string;
    data?: Record<string, any>;
    read: boolean;
    created_at: string;
    read_at?: string;
    action_url?: string;
    image_url?: string;
}

export interface GroupNotification {
    title: string;
    body: string;
    data?: Record<string, any>;
    category?: string;
    image_url?: string;
    action_url?: string;
    // Целевая аудитория
    target: {
        user_ids?: string[];
        segments?: string[];
        filters?: {
            countries?: string[];
            languages?: string[];
            app_versions?: string[];
            platforms?: string[];
            subscription_types?: string[];
            registration_period?: {
                start: string;
                end: string;
            };
        };
    };
    // Настройки отправки
    delivery_settings?: {
        ttl?: number; // время жизни уведомления в секундах
        priority?: 'normal' | 'high';
        collapse_key?: string; // идентификатор для группировки уведомлений
    };
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

// Новые типы для расширенной функциональности

export interface RecurringNotification {
    id: string;
    title: string;
    body: string;
    category?: {
        id: string;
        name: string;
        description?: string;
        is_default_enabled: boolean;
    };
    category_id?: string;
    data?: Record<string, any>;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string; // "HH:mm:ss"
    day_of_week?: number; // 0-6, где 0 - воскресенье
    day_of_month?: number; // 1-31
    all_users: boolean;
    specific_users?: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_sent_at?: string;
}

export interface Quote {
    id: string;
    text: string;
    author?: string;
    source?: string;
    category?: {
        id: string;
        name: string;
        description?: string;
        is_default_enabled: boolean;
    };
    category_id?: string;
    is_used: boolean;
    created_at: string;
}

export interface NotificationSettingsWithCategories {
    settings: NotificationSettings;
    categories: Array<NotificationCategory & { is_default_enabled: boolean }>;
}
