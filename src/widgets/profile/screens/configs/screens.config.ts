import { EditProfileField } from '@features/EditProfileField/EditProfileField'
import { t } from 'i18next'
import { FC } from 'react'
import { DefaultScreen } from '../DefaultScreen'
import { FullProfileScreen } from '../FullProfileScreen'
import { LanguageScreen } from '../inner/LanguageScreen'
import { LoggingScreen } from '../inner/LoggingScreen'
import { NotificationScreen } from '../inner/NotificationScreen'
import { StorageScreen } from '../inner/StorageScreen'
import { ThemeScreen } from '../inner/ThemeScreen'
import { SettingsScreen } from '../SettingsScreen'
import { SubscriptionSettingScreen } from '../SubscriptionSettingScreen'

export type ScreenType =
    | 'main'
    | 'settings'
    | 'profile'
    | 'notifications'
    | 'theme'
    | 'language'
    | 'email'
    | 'phone'
    | 'timezone'
    | 'storage'
    | 'subscription'
    | 'logs'

    
type ScreenConfig = {
    [K in ScreenType]: {
        level: number;
        component: FC<any>;
        props?: Record<string, any>;
    }
}

export const SCREEN_CONFIG: ScreenConfig = {
    main: {
        level: 0,
        component: DefaultScreen
    },
    settings: {
        level: 1,
        component: SettingsScreen
    },
    profile: {
        level: 1,
        component: FullProfileScreen
    },
    notifications: {
        level: 2,
        component: NotificationScreen
    },
    theme: {
        level: 2,
        component: ThemeScreen
    },
    language: {
        level: 2,
        component: LanguageScreen
    },
    storage: {
        level: 2,
        component: StorageScreen
    },
    subscription: {
        level: 2,
        component: SubscriptionSettingScreen
    },
    email: {
        level: 2,
        component: EditProfileField,
        props: {
            field: 'email',
            title: t('profile.editEmail'),
            placeholder: 'email@example.com',
            validator: (value: string) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(value)) return t('validation.invalidEmail')
            }
        }
    },
    phone: {
        level: 2,
        component: EditProfileField,
        props: {
            field: 'phone',
            title: t('profile.editPhone'),
            placeholder: '+1234567890',
            validator: (value: string) => {
                if (!/^\+\d{10,}$/.test(value)) return t('validation.invalidPhone')
            }
        }
    },
    timezone: {
        level: 2,
        component: EditProfileField,
        props: {
            field: 'timezone',
            title: t('profile.editTimezone')
        }
    },
    logs: {
        level: 2,
        component: LoggingScreen
    }
}
