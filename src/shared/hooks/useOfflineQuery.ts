// src/shared/hooks/api/useOfflineQuery.ts
import { useNetwork } from '@shared/hooks/systems/network/useNetwork'
import { storage } from '@shared/lib/storage/storage.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Хук для офлайн мутаций
export function useOfflineMutation<TData>(
  key: string,
  mutationFn: (data: TData) => Promise<any>
) {
    const queryClient = useQueryClient();
  const { isOnline } = useNetwork();

  return useMutation({
    mutationFn: async (data: TData) => {
      // Если офлайн - сохраняем локально
      if (!isOnline) {
        const offlineData = await storage.get<TData[]>(`offline_${key}`) || [];
        await storage.set(`offline_${key}`, [...offlineData, data]);
        return data;
      }

      // Если онлайн - отправляем на сервер
      return await mutationFn(data);
    },

    // Оптимистичное обновление UI
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [key] });
      const previous = queryClient.getQueryData([key]);
      
      queryClient.setQueryData([key], (old: any[] = []) => [data, ...old]);
      
      return { previous };
    },

    onError: (err, data, context) => {
      queryClient.setQueryData([key], context?.previous);
    }
  });
}