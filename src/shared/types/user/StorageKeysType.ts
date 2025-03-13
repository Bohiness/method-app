import { EveningReflection } from '@shared/types/diary/eveningreflection/EveningReflectionType';
import { SupportedLocale } from './SupportedLocale';
import { UserType } from './UserType';

export interface StorageKeysType {
    'user-session': {
        access: string;
        refresh: string;
        expiresAt: number;
    };
    'csrf-token': string;
    'user-data': UserType;
    'app-settings': {
        theme: 'light' | 'dark';
        language: 'ru' | 'en';
        notifications: boolean;
    };
    'onboarding-completed': boolean;
    'app-locale': SupportedLocale;
    'app-timezone': string;
    'evening-reflection': EveningReflection[];
}
