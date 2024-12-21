import { SupportedLocale } from './SupportedLocale'
import { UserType } from './UserType'

export interface StorageKeysType {
  'user-session': {
    token: string;
    refreshToken: string;
    expiresAt: number;
  };
  'user-data': UserType;
  'app-settings': {
    theme: 'light' | 'dark';
    language: 'ru' | 'en';
    notifications: boolean;
  };
  'onboarding-completed': boolean;
  'app-locale': SupportedLocale;
}