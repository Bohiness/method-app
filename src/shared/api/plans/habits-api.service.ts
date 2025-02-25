import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';
import { CreateHabitDtoType, HabitFiltersType, HabitType, UpdateHabitDtoType } from '@shared/types/plans/HabitTypes';

export const habitsApiService = {
    // Получение привычек с возможными фильтрами
    getHabits: async (filters?: HabitFiltersType) => {
        const url = API_ROUTES.HABITS.BASE;
        return await apiClient.get<PaginatedResponse<HabitType>>(url);
    },

    // Создание новой привычки
    createHabit: async (data: CreateHabitDtoType) => {
        const response = await apiClient.post(API_ROUTES.HABITS.BASE, data);
        return response;
    },

    // Обновление привычки
    updateHabit: async (habitId: number, data: UpdateHabitDtoType) => {
        const response = await apiClient.put(API_ROUTES.HABITS.byId(habitId), data);
        return response;
    },

    // Удаление привычки
    deleteHabit: async (habitId: number) => {
        const response = await apiClient.delete(API_ROUTES.HABITS.byId(habitId));
        return response;
    },

    // Завершение (выполнение) привычки для текущего периода (например, для сегодняшнего дня)
    completeHabit: async (habitId: number, easeRating?: number) => {
        // Предполагается, что API_ROUTES.HABITS.complete возвращает URL вида: /api/habits/<habitId>/complete/
        const url = API_ROUTES.HABITS.complete(habitId);
        const data = easeRating ? { ease_rating: easeRating } : {};
        const response = await apiClient.post(url, data);
        return response;
    },
};
