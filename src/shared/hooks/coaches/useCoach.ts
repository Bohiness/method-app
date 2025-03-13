import { coachesApiService } from '@shared/api/coaches/coaches-api.service';
import { packagesApiService } from '@shared/api/coaches/packages-api.service';
import { CoachType } from '@shared/types/coaches/CoachType';
import { PackageType } from '@shared/types/coaches/PackageType';
import { PaginatedResponse } from '@shared/types/PaginatedResponse';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useCoaches(filters?: Record<string, string>) {
    const result = useQuery<PaginatedResponse<CoachType>, Error>({
        queryKey: ['coaches'],
        queryFn: () => coachesApiService.getCoaches(filters),
        retry: 3,
        staleTime: 5 * 60 * 1000,
    });

    return {
        coaches: result.data?.results ?? [],
        totalCount: result.data?.count ?? 0,
        nextPage: result.data?.next ?? null,
        previousPage: result.data?.previous ?? null,
        isPending: result.isPending,
        error: result.error,
    };
}

export function useCoach(id: number, initialData?: CoachType) {
    const queryClient = useQueryClient();

    const data = useQuery<CoachType, Error>({
        queryKey: ['coach', id],
        queryFn: () => coachesApiService.getCoachById(id),
        retry: 3,
        staleTime: 5 * 60 * 1000,
        enabled: !!id,
        initialData: () => {
            if (initialData) return initialData;
            const coaches = queryClient.getQueryData<PaginatedResponse<CoachType[]>>(['coaches']);
            return coaches?.results.find((coach: CoachType) => coach.id === id);
        },
    });

    return {
        coach: data.data,
        isPending: data.isPending,
        error: data.error,
    };
}

export function usePackages(coach_id: number) {
    const result = useQuery<PaginatedResponse<PackageType[]>, Error>({
        queryKey: ['packages', coach_id],
        queryFn: () => packagesApiService.getPackagesByCoachId(coach_id),
    });

    return {
        packages: result.data?.results || [],
        totalCount: result.data?.count || 0,
        nextPage: result.data?.next || null,
        previousPage: result.data?.previous || null,
        isPending: result.isPending,
        error: result.error,
    };
}
