// src/shared/constants/api-routes.ts

import { buildUrl } from '@shared/lib/url/buildUrl';

export const API_ROUTES = {
    BASE: process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do',
    AUTH: {
        REFRESH_TOKEN: '/api/token/refresh/',
        CHECK_EMAIL: '/apiV2/auth/check-email/',
        FORGOT_PASSWORD: 'api/v2/auth/forgotpassword/sendcode/',
        CHECK_CODE: 'api/v2/auth/forgotpassword/checkcode/',
        SET_PASSWORD: 'api/v2/auth/forgotpassword/setpassword/',
        LOGIN: '/apiV2/auth/login/',
        REGISTER: '/apiV2/auth/register/',
        CHECK_AUTH: '/apiV2/user/checkAuthenticate/',
        LOGOUT: '/apiV2/auth/logout/',
        // Добавляем маршруты для анонимных пользователей
        ANONYMOUS: {
            CREATE: '/api/v2/user/anonymous/',
            CONVERT: '/api/v2/user/anonymous/convert/',
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
    },
    PLANS: {
        TASKS: '/api/plans/tasks/',
        tasksById: (id: number) => `${API_ROUTES.PLANS.TASKS}${id}/`,
        PROJECTS: '/api/plans/projects/',
        projectsById: (id: number) => `${API_ROUTES.PLANS.PROJECTS}${id}/`,
    },
    AI: {
        CHAT: '/api/v1/ai/chat/',
        VOICE: '/api/v1/ai/voice/',
    },
    FILES: {
        UPLOAD: '/api/file/upload/',
    },
    HABITS: {
        BASE: '/api/habits/',
        byId: (id: number) => `${API_ROUTES.HABITS.BASE}${id}/`,
        complete: (id: number) => `${API_ROUTES.HABITS.BASE}${id}/complete/`,
    },
} as const;
