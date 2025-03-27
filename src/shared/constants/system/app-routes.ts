export const APP_ROUTES = {
    MODALS: {
        DIARY: {
            MOOD: '(modals)/(diary)/mood',
            START_YOUR_DAY: '(modals)/(diary)/start-your-day',
            EVENING_REFLECTION: '(modals)/(diary)/evening-reflection',
            JOURNAL: {
                EDITOR: '(modals)/(diary)/journal/journal-editor',
                SUCCESS: '(modals)/(diary)/journal/success-screen',
                ENTRY: '(modals)/(diary)/journal/journal-entry',
            },
            BEAUTIFUL_DIARY: '(modals)/(diary)/beautiful-diary',
        },
        PLANS: {
            NEW_PROJECT: '(modals)/(plans)/new-project',
            NEW_HABIT: '(modals)/(plans)/new-habit',
            NEW_TASK: '(modals)/(plans)/new-task',
            SETTINGS: {
                BASE: '(modals)/(plans)/settings',
                PROJECTS_LIST: '(modals)/(plans)/settings/projects-list',
                TASKS_HISTORY: '(modals)/(plans)/settings/tasks-history',
            },
        },
        PAYMENT: {
            SUBSCRIPTION: '(modals)/(payment)/subscription',
        },
        SETTINGS: {
            BASE: '(modals)/(settings)/base',
            STORAGE_ITEM: '(modals)/(settings)/storage-item',
            AI_TONE_OF_VOICE: '(modals)/(settings)/ai-tone-of-voice',
            QUICK_ACCESS: '(modals)/(settings)/quick-access',
        },
    },
} as const;
