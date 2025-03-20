// src/features/onboarding/config/screens.ts

import { AboutYouScreen } from '../screens/AboutYou';
import { Ask1Screen } from '../screens/Ask1-age';
import { Ask2Screen } from '../screens/Ask2-gender';
import { Ask3Screen } from '../screens/Ask3-name';
import { Ask4Screen } from '../screens/Ask4';
import { LastScreen } from '../screens/LastScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationsScreen2 } from '../screens/NotificationsScreen2';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { OnboardingScreen } from '../types/OnboardingTypes';

// Конфигурация экранов
export const screens: OnboardingScreen[] = [
    {
        key: 'welcome',
        component: WelcomeScreen,
        canSkip: false,
        canBack: false,
    },
    {
        key: 'features',
        component: AboutYouScreen,
        canSkip: false,
        canBack: true,
    },
    {
        key: 'ask1',
        component: Ask1Screen,
        canSkip: true,
        canBack: true,
    },
    {
        key: 'ask2',
        component: Ask2Screen,
        canSkip: true,
        canBack: true,
    },
    {
        key: 'ask3',
        component: Ask3Screen,
        canSkip: true,
        canBack: true,
    },
    {
        key: 'ask4',
        component: Ask4Screen,
        canSkip: true,
        canBack: true,
    },
    {
        key: 'notifications',
        component: NotificationsScreen,
        canSkip: false,
        canBack: true,
    },
    {
        key: 'notifications2',
        component: NotificationsScreen2,
        canSkip: false,
        canBack: true,
    },
    {
        key: 'last',
        component: LastScreen,
        canSkip: false,
        canBack: false,
    },
];
