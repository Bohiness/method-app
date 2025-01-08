import { apiClient } from '@shared/config/api-client'
import { CoachType } from '@shared/types/coaches/CoachType'
import { PaginatedResponse } from '@shared/types/PaginatedResponse'

class CoachesApiService {

    private readonly BASE_URL = `/api/coaches`

    async getCoaches(params?: Record<string, string>): Promise<PaginatedResponse<CoachType>> {
        const queryParams = params ? `?${new URLSearchParams(params)}` : ''
        const response = await apiClient.get<PaginatedResponse<CoachType>>(`${this.BASE_URL}/${queryParams}`)
        return response
    }

    async getCoachById(id: number): Promise<CoachType> {
        const response = await apiClient.get<CoachType>(`${this.BASE_URL}/${id}/`)
        return response
    }
}

export const coachesApiService = new CoachesApiService()