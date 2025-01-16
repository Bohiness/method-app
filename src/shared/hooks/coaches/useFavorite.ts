'use client';

import { favoriteApiService } from '@shared/api/coaches/favorite-api.service'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useOfflineMutation } from '../useOfflineQuery'

interface Favorite {
  id: number;
  coach: number;
  created_at: string;
}
export function useFavorite() {
    const queryClient = useQueryClient();

    const {
        data: favorites = [],
        isLoading,
        error,
    } = useQuery<Favorite[], Error>({
        queryKey: ['favorites'],
        queryFn: favoriteApiService.getFavorites,
    });

    const mutation = useOfflineMutation<number>(
        'favorites',
        favoriteApiService.toggleFavorite,
        {
            optimisticUpdate: (oldData: Favorite[], coachId: number) => {
                const isCurrentlyFavorite = oldData.some(fav => fav.coach === coachId);
                
                if (isCurrentlyFavorite) {
                    return oldData.filter(fav => fav.coach !== coachId);
                } else {
                    return [...oldData, {
                        id: Date.now(),
                        coach: coachId,
                        created_at: new Date().toISOString()
                    }];
                }
            }
        }
    );

    const isFavorite = (coachId: number): boolean => {
        return favorites.some((fav) => fav.coach === coachId);
    };

    const toggleFavorite = (coachId: number) => {
      mutation.mutate(coachId);
  };

    return {
        favorites,
        isLoading,
        error,
        toggleFavorite,
        isFavorite,
        isToggling: mutation.isPending
    };
}