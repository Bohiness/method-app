import { STORAGE_KEYS } from '@shared/constants/STORAGE_KEYS';
import { EveningReflectionType } from '@shared/types/diary/eveningreflection/EveningReflectionType';
import { SupportedLocale } from './SupportedLocale';
import { UserType } from './UserType';

export interface StorageKeysType {
    [STORAGE_KEYS.USER_SESSION]: {
        access: string;
        refresh: string;
        expiresAt: number;
    };
    [STORAGE_KEYS.CSRF_TOKEN]: string;
    [STORAGE_KEYS.USER_DATA]: UserType;
    [STORAGE_KEYS.APP_SETTINGS]: {
        theme: 'light' | 'dark';
        language: 'ru' | 'en';
        notifications: boolean;
    };
    [STORAGE_KEYS.ONBOARDING_COMPLETED]: boolean;
    [STORAGE_KEYS.APP_LOCALE]: SupportedLocale;
    [STORAGE_KEYS.APP_TIMEZONE]: string;
    [STORAGE_KEYS.EVENING_REFLECTION]: EveningReflectionType[];
    [STORAGE_KEYS.SUBSCRIPTION_ACTIVE_BY_ADMIN]: boolean;
}
