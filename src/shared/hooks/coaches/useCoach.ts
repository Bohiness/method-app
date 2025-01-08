import { coachesApiService } from '@shared/api/coaches/coaches.api-service'
import { CoachType } from '@shared/types/coaches/CoachType'
import { PaginatedResponse } from '@shared/types/PaginatedResponse'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useCoach(id: number, initialData?: CoachType) {
  const queryClient = useQueryClient();

  return useQuery<CoachType, Error>({
    queryKey: ['coach', id],
    queryFn: () => coachesApiService.getCoachById(id),
    retry: 3,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    initialData: () => {
      if (initialData) return initialData;
      const coaches = queryClient.getQueryData<PaginatedResponse<CoachType>>(['coaches']);
      return coaches?.results.find((coach) => coach.id === id);
    },
  });
}

export function useCoaches(filters?: Record<string, string>) {
  const result = useQuery<PaginatedResponse<CoachType>, Error>({
    queryKey: ['coaches', filters],
    queryFn: () => coachesApiService.getCoaches(filters),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  return {
    coaches: result.data?.results ?? [],
    totalCount: result.data?.count ?? 0,
    nextPage: result.data?.next ?? null,
    previousPage: result.data?.previous ?? null,
    isFetching: result.isFetching,
    error: result.error,
  };
}
