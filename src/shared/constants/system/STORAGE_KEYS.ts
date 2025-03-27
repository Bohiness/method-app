export const STORAGE_KEYS = {
    DIARY: {
        EVENING_REFLECTION: 'evening-reflections',
        JOURNAL: 'journal',
        JOURNAL_TEMPLATES: 'journal-templates',
        START_DAY: 'start-day',
        MOOD_CHECK_IN: 'mood-check-in',
    },
    SETTINGS: {
        QUICK_ACCESS: 'quick-access',
        AI_TONE_OF_VOICE: 'ai-tone-of-voice',
        APP_SETTINGS: 'app-settings',
    },
    USER: {
        USER_DATA: 'user-data',
        USER_SESSION: 'user-session',
        CSRF_TOKEN: 'csrf-token',
    },
    APP: {
        APP_TIMEZONE: 'app-timezone',
        APP_LOCALE: 'app-locale',
        ONBOARDING_COMPLETED: 'onboarding-completed',
        APP_SETTINGS: 'app-settings',
    },
    SUBSCRIPTION: {
        SUBSCRIPTION_STATUS: 'subscription-status',
        SUBSCRIPTION_ACTIVE_BY_ADMIN: 'subscription-active-by-admin',
    },
    PLANS: {
        TASKS: 'offline-tasks',
        PENDING_CHANGES: 'tasks-pending-changes',
    },
} as const;
