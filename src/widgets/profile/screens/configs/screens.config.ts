import { EditGender } from '@features/EditProfileField/EditGender';
import { EditNames } from '@features/EditProfileField/EditNames';
import { EditPhoto } from '@features/EditProfileField/EditPhoto';
import { EditProfileField } from '@features/EditProfileField/EditProfileField';
import { t } from 'i18next';
import { FC } from 'react';
import { DefaultScreen } from '../DefaultScreen';
import { FullProfileScreen } from '../FullProfileScreen';
import { DiaryScreen } from '../inner/DiaryScreen';
import { JournalScreen } from '../inner/JournalScreen';
import { LanguageScreen } from '../inner/LanguageScreen';
import { LoggingScreen } from '../inner/LoggingScreen';
import { NotificationSettingsScreen } from '../inner/NotificationScreen';
import MyProjectsScreen from '../inner/Projects/MyProjectsScreen';
import { RevenueCatDebugScreen } from '../inner/RevenueCatDebugScreen';
import { SendErrorReportScreen } from '../inner/SendErrorReportScreen';
import { StorageScreen } from '../inner/StorageScreen';
import { StorageValueModal } from '../inner/StorageValueModal';
import { ThemeScreen } from '../inner/ThemeScreen';
import { PlansSettingScreen } from '../PlansSettingScreen';
import { SettingsScreen } from '../SettingsScreen';
import { SubscriptionSettingScreen } from '../SubscriptionSettingScreen';

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
    | 'plans'
    | 'myProjects'
    | 'names'
    | 'gender'
    | 'profile_photo'
    | 'diary'
    | 'storageValue'
    | 'revenuecat'
    | 'sendErrorReport'
    | 'journal';

type ScreenConfig = {
    [K in ScreenType]: {
        level: number;
        component: FC<any>;
        props?: Record<string, any>;
    };
};

export const SCREEN_CONFIG: ScreenConfig = {
    main: {
        level: 0,
        component: DefaultScreen,
    },
    settings: {
        level: 1,
        component: SettingsScreen,
    },
    profile: {
        level: 1,
        component: FullProfileScreen,
    },
    notifications: {
        level: 2,
        component: NotificationSettingsScreen,
    },
    theme: {
        level: 2,
        component: ThemeScreen,
    },
    language: {
        level: 2,
        component: LanguageScreen,
    },
    storage: {
        level: 2,
        component: StorageScreen,
    },
    subscription: {
        level: 2,
        component: SubscriptionSettingScreen,
    },
    email: {
        level: 2,
        component: EditProfileField,
        props: {
            field: 'email',
            title: t('profile.editEmail'),
            placeholder: 'email@example.com',
            validator: (value: string) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return t('validation.invalidEmail');
            },
        },
    },
    phone: {
        level: 2,
        component: EditProfileField,
        props: {
            field: 'phone',
            title: t('profile.editPhone'),
            placeholder: '+1234567890',
            validator: (value: string) => {
                if (!/^\+\d{10,}$/.test(value)) return t('validation.invalidPhone');
            },
        },
    },
    timezone: {
        level: 2,
        component: EditProfileField,
        props: {
            field: 'timezone',
            title: t('profile.editTimezone'),
        },
    },
    logs: {
        level: 2,
        component: LoggingScreen,
        props: {
            title: t('settings.logs.title'),
        },
    },
    plans: {
        level: 1,
        component: PlansSettingScreen,
    },
    myProjects: {
        level: 2,
        component: MyProjectsScreen,
    },
    names: {
        level: 2,
        component: EditNames,
        props: {
            title: t('profile.edit.names.title'),
        },
    },
    gender: {
        level: 2,
        component: EditGender,
        props: {
            title: t('profile.edit.gender.title'),
        },
    },
    profile_photo: {
        level: 2,
        component: EditPhoto,
        props: {
            title: t('profile.edit.photo.title'),
        },
    },
    diary: {
        level: 2,
        component: DiaryScreen,
    },
    storageValue: {
        level: 2,
        component: StorageValueModal,
    },
    revenuecat: {
        level: 2,
        component: RevenueCatDebugScreen,
        props: {
            title: t('settings.revenuecat.title'),
        },
    },
    sendErrorReport: {
        level: 2,
        component: SendErrorReportScreen,
    },
    journal: {
        level: 2,
        component: JournalScreen,
    },
};
