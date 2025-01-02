// src/shared/constants/api-routes.ts

export const API_ROUTES = {
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
      }
    }
  } as const;