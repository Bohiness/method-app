import { STORAGE_KEYS } from '@shared/constants/system/STORAGE_KEYS';
import { APP_ROUTES } from '@shared/constants/system/app-routes';
import { AppActivity } from '@shared/hooks/systems/useAppActivity';

export const APP_ACTIVITY_KEYS = [
    'mood',
    'journal',
    'startDay',
    'eveningReflection',
    'newTask',
    'journalNewEntry',
] as const;
export const APP_ACTIVITY_CATEGORY_KEYS = ['diary', 'settings', 'planning'] as const;

export const APP_ACTIVITY_CATEGORIES = [
    {
        id: '1',
        key: 'diary',
        titleKey: 'diary.title',
    },
    {
        id: '2',
        key: 'settings',
        titleKey: 'settings.title',
    },
    {
        id: '3',
        key: 'planning',
        titleKey: 'planning.title',
    },
];

export const appActivity: AppActivity[] = [
    {
        id: '1',
        key: 'mood',
        categoryKey: 'diary',
        titleKey: 'diary.moodcheckin.title',
        descriptionKey: 'diary.moodcheckin.description',
        icon: 'Rabbit',
        path: APP_ROUTES.MODALS.DIARY.MOOD,
        storageKey: STORAGE_KEYS.DIARY.MOOD_CHECK_IN,
    },
    {
        id: '2',
        key: 'journal',
        categoryKey: 'diary',
        titleKey: 'diary.beautifuldiary.title',
        descriptionKey: 'diary.beautifuldiary.description',
        icon: 'FileText',
        path: APP_ROUTES.MODALS.DIARY.JOURNAL.ENTRY,
        storageKey: STORAGE_KEYS.DIARY.JOURNAL,
    },
    {
        id: '3',
        key: 'startDay',
        categoryKey: 'diary',
        titleKey: 'diary.startYourDay.title',
        descriptionKey: 'diary.startYourDay.description',
        icon: 'Sun',
        path: APP_ROUTES.MODALS.DIARY.START_YOUR_DAY,
        storageKey: STORAGE_KEYS.DIARY.START_DAY,
    },
    {
        id: '4',
        key: 'eveningReflection',
        categoryKey: 'diary',
        titleKey: 'diary.eveningreflection.title',
        descriptionKey: 'diary.eveningreflection.description',
        icon: 'Moon',
        path: APP_ROUTES.MODALS.DIARY.EVENING_REFLECTION,
        storageKey: STORAGE_KEYS.DIARY.EVENING_REFLECTION,
    },
    {
        id: '5',
        key: 'newTask',
        categoryKey: 'planning',
        titleKey: 'plans.tasks.new.title',
        descriptionKey: 'plans.tasks.new.description',
        icon: 'Plus',
        path: APP_ROUTES.MODALS.PLANS.NEW_TASK,
        storageKey: STORAGE_KEYS.PLANS.TASKS,
    },
    {
        id: '6',
        key: 'journalNewEntry',
        categoryKey: 'diary',
        titleKey: 'diary.journal.newEntry',
        descriptionKey: 'diary.journal.description',
        icon: 'Pencil',
        path: APP_ROUTES.MODALS.DIARY.JOURNAL.ENTRY,
        storageKey: STORAGE_KEYS.DIARY.JOURNAL,
    },
];
