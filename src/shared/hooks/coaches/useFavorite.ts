'use client';

import { favoriteApiService } from '@shared/api/coaches/favorite.api-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface Favorite {
  id: number;
  coach: number;
  created_at: string;
}

/**
 * Хук для управления избранными коучами
 * @returns {Object} Объект с функциями и данными для работы с избранными коучами
 */
export function useFavorite() {
  const queryClient = useQueryClient();


  const {
    data: favorites,
    isLoading,
    error,
  } = useQuery<Favorite[], Error>({
    queryKey: ['favorites'],
    queryFn: favoriteApiService.getFavorites,
  });

  
  const mutation = useMutation({
    mutationFn: favoriteApiService.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  
  /**
   * Проверка, находится ли коуч в избранном
   * @param {number} coachId - ID коуча
   * @returns {boolean} true, если коуч в избранном, иначе false
   */
  const isFavorite = (coachId: number): boolean => {
    return (
      Array.isArray(favorites) && favorites.some((fav) => fav.coach === coachId)
    );
  };

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite: (coachId: number) => mutation.mutate(coachId),
    isFavorite,
    isToggling: mutation.isPending || isLoading,
  };
}
