// src/shared/constants/api-routes.ts

import { buildUrl } from '@shared/lib/url/buildUrl';

export const API_ROUTES = {
    BASE: process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do',
    AUTH: {
        TOKENS: {
            BASE: '/api/token/',
            REFRESH: '/api/token/refresh/',
            VALIDATE: '/api/token/validate/',
            CSRF_TOKEN: '/api/token/csrf/',
        },
        CHECK_EMAIL: '/api/v2/auth/check-email/',
        FORGOT_PASSWORD: '/api/v2/auth/forgotpassword/sendcode/',
        CHECK_CODE: '/api/v2/auth/forgotpassword/checkcode/',
        SET_PASSWORD: '/api/v2/auth/forgotpassword/setpassword/',
        LOGIN: '/api/v2/auth/login/',
        REGISTER: '/api/v2/auth/register/',
        CHECK_AUTH: '/api/v2/auth/checkAuthenticate/',
        LOGOUT: '/api/v2/auth/logout/',
        GOOGLE_AUTH: '/api/google/login/',
        GOOGLE_AUTH_CALLBACK: '/api/google/callback/mobile/',
        APPLE_AUTH: '/api/apple/login/',
        ANONYMOUS: {
            CREATE: '/api/v2/user/anonymous/',
            CONVERT: '/api/v2/user/convert/',
        },
    },
    FAVORITES: {
        BASE: '/api/favorites/',
        TOGGLE: '/api/favorites/toggle/',
    },
    COACHES: {
        BASE: '/api/coaches',
        byId: (id: number) => `${API_ROUTES.COACHES.BASE}/${id}`,
        search: (params?: Record<string, string>) => buildUrl(API_ROUTES.COACHES.BASE, undefined, params),
    },
    PACKAGES: {
        BASE: '/api/packages/',
        byCoachId: (id: number) => `${API_ROUTES.PACKAGES.BASE}${id}/`,
    },
    USER: {
        BASE: '/api/v2/user/',
        UPDATE_PHOTO: '/api/user/upload_profile_photo/',
        update: (id: number) => `${API_ROUTES.USER.BASE}${id}/`,
        SUBSCRIPTION: '/api/user/app/subscription/',
        VERIFY_SUBSCRIPTION: '/api/user/app/subscription/verify/',
    },
    PLANS: {
        TASKS: '/api/v1/plans/tasks/',
        tasksById: (id: number) => `${API_ROUTES.PLANS.TASKS}${id}/`,
        PROJECTS: '/api/v1/plans/projects/',
        projectsById: (id: number) => `${API_ROUTES.PLANS.PROJECTS}${id}/`,
        CREATE_VOICE_TASKS: '/api/v1/plans/voice-tasks/',
        CREATE_TASKS_BY_AI_WITH_TEXT: '/api/v1/plans/create-tasks-by-ai-with-text/',
    },
    AI: {
        CHAT: '/api/v1/ai/chat/',
        VOICE: '/api/v1/ai/voice/',
        GENERATE_TEXT: '/api/v1/ai/text/',
    },
    FILES: {
        UPLOAD: '/api/file/upload/',
    },
    HABITS: {
        BASE: '/api/habits/',
        byId: (id: number) => `${API_ROUTES.HABITS.BASE}${id}/`,
        complete: (id: number) => `${API_ROUTES.HABITS.BASE}${id}/complete/`,
    },
    DIARY: {
        EVENING_REFLECTION: '/api/evening-reflections/',
        START_DAY: '/api/start-day/',
        JOURNAL: '/api/journal/',
        EMOTIONS: '/api/emotions/',
    },
    ERROR_REPORT: '/api/mobile/error-report/',
} as const;
