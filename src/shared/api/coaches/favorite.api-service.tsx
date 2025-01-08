import { apiClient } from '@shared/config/api-client'
import { FavoriteType } from '@shared/types/coaches/FavoriteType'


class FavoriteApiService {

    private readonly BASE_URL = `/api/favorites`;

    /**
     * Получение списка избранных коучей
     * @returns {Promise<FavoriteType[]>} Список избранных коучей
     */
    async getFavorites(): Promise<FavoriteType[]> {
        const response = await apiClient.get<FavoriteType[]>(`${this.BASE_URL}/`)
        return response
    }

    /**
     * Добавление/удаление коуча из избранного
     * @param {number} coachId - ID коуча
     * @returns {Promise<{status: string}>} Статус операции
     */
    async toggleFavorite(coachId: number): Promise<{ status: string }> {
        const response = await apiClient.post<{ status: string }>(`${this.BASE_URL}/toggle/`, {
            coach_id: coachId,
        })
        return response
    }
}

export const favoriteApiService = new FavoriteApiService()