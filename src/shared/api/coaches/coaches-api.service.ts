import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { CoachType } from '@shared/types/coaches/CoachType';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';

class CoachesApiService {
    async getCoaches(params?: Record<string, string>): Promise<PaginatedResponse<CoachType>> {
        const response = await apiClient.get<PaginatedResponse<CoachType>>(API_ROUTES.COACHES.search(params));
        return response;
    }

    async getCoachById(id: number): Promise<CoachType> {
        const response = await apiClient.get<CoachType>(API_ROUTES.COACHES.byId(id));
        return response;
    }
}

export const coachesApiService = new CoachesApiService();
