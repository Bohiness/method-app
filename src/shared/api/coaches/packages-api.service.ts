import { apiClient } from '@shared/config/api-client'
import { API_ROUTES } from '@shared/constants/api-routes'
import { PackageType } from '@shared/types/coaches/PackageType'
import { PaginatedResponse } from '@shared/types/PaginatedResponse'

class PackagesApiService {

    async getPackagesByCoachId(coachId: number): Promise<PaginatedResponse<PackageType[]>> {
        const response = await apiClient.get<PaginatedResponse<PackageType[]>>(
            API_ROUTES.PACKAGES.byCoachId(coachId)
        )
        return response
    }
}

export const packagesApiService = new PackagesApiService()