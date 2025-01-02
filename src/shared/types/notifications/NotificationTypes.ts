
export interface DeviceToken {
    token: string;
    device_id: string;
    platform: 'ios' | 'android';
    user_id: number;
    is_active: boolean;
}

export interface PushNotification {
    title: string;
    body: string;
    data?: Record<string, any>;
    badge?: number;
    sound?: string;
    priority?: 'default' | 'normal' | 'high';
}