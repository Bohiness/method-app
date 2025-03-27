import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { EveningReflectionType } from '@shared/types/diary/eveningreflection/EveningReflectionType';
import { SupportedLocale } from './SupportedLocale';
import { UserType } from './UserType';

export interface StorageKeysType {
    [STORAGE_KEYS.USER.USER_SESSION]: {
        access: string;
        refresh: string;
        expiresAt: number;
    };
    [STORAGE_KEYS.USER.CSRF_TOKEN]: string;
    [STORAGE_KEYS.USER.USER_DATA]: UserType;
    [STORAGE_KEYS.APP.APP_SETTINGS]: {
        theme: 'light' | 'dark';
        language: 'ru' | 'en';
        notifications: boolean;
    };
    [STORAGE_KEYS.APP.ONBOARDING_COMPLETED]: boolean;
    [STORAGE_KEYS.APP.APP_LOCALE]: SupportedLocale;
    [STORAGE_KEYS.APP.APP_TIMEZONE]: string;
    [STORAGE_KEYS.DIARY.EVENING_REFLECTION]: EveningReflectionType[];
    [STORAGE_KEYS.SUBSCRIPTION.SUBSCRIPTION_ACTIVE_BY_ADMIN]: boolean;
}
