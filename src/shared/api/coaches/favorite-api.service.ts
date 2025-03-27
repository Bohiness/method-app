import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { FavoriteType } from '@shared/types/coaches/FavoriteType';

class FavoriteApiService {
    /**
     * Получение списка избранных коучей
     * @returns {Promise<FavoriteType[]>} Список избранных коучей
     */
    async getFavorites(): Promise<FavoriteType[]> {
        const response = await apiClient.get<FavoriteType[]>(API_ROUTES.FAVORITES.BASE);
        return response;
    }

    /**
     * Добавление/удаление коуча из избранного
     * @param {number} coachId - ID коуча
     * @returns {Promise<{status: string}>} Статус операции
     */
    async toggleFavorite(coachId: number): Promise<{ status: string }> {
        const response = await apiClient.post<{ status: string }>(API_ROUTES.FAVORITES.TOGGLE, {
            coach_id: coachId,
        });
        return response;
    }
}

export const favoriteApiService = new FavoriteApiService();
