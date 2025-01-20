// src/shared/constants/api-routes.ts

import { buildUrl } from '@shared/lib/url/buildUrl';

export const API_ROUTES = {
    BASE: process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do',
    AUTH: {
        CHECK_EMAIL: '/apiV2/auth/check-email/',
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
    },
    PLANS: {
        TASKS: '/api/plans/tasks/',
        tasksById: (id: number) => `${API_ROUTES.PLANS.TASKS}${id}/`,
        PROJECTS: '/api/plans/projects/',
        projectsById: (id: number) => `${API_ROUTES.PLANS.PROJECTS}/${id}/`,
    },
} as const;
