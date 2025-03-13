// src/shared/hooks/api/useOfflineQuery.ts
import { useNetwork } from '@shared/hooks/systems/network/useNetwork'
import { storage } from '@shared/lib/storage/storage.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface OfflineMutationOptions<TData, TError = Error, TContext = unknown> {
  onMutate?: (data: TData) => Promise<TContext> | TContext
  onError?: (error: TError, data: TData, context: TContext | null) => void
  onSuccess?: (data: TData, variables: TData, context: TContext | null) => void
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TData,
    context: TContext | null
  ) => void
  optimisticUpdate?: (oldData: any, newData: TData) => any
}

export function useOfflineMutation<TData, TError = Error, TContext = unknown>(
  key: string,
  mutationFn: (data: TData) => Promise<any>,
  options?: OfflineMutationOptions<TData, TError, TContext>
) {
  const queryClient = useQueryClient()
  const { isOnline } = useNetwork()

  return useMutation<TData, TError, TData, TContext>({
    mutationFn: async (data: TData) => {
      try {
        // Если офлайн - сохраняем локально
        if (!isOnline) {
          const offlineData = await storage.get<TData[]>(`offline_${key}`) || []
          await storage.set(`offline_${key}`, [...offlineData, data])
          return data
        }

        // Если онлайн - отправляем на сервер
        return await mutationFn(data)
      } catch (error) {
        // Если произошла ошибка при отправке на сервер, сохраняем локально
        const offlineData = await storage.get<TData[]>(`offline_${key}`) || []
        await storage.set(`offline_${key}`, [...offlineData, data])
        throw error
      }
    },

    // Оптимистичное обновление UI
    onMutate: async (newData) => {
      let context: TContext | null = null

      // Выполняем пользовательский onMutate если он есть
      if (options?.onMutate) {
        context = await options.onMutate(newData)
      } else {
        // Стандартное оптимистичное обновление
        await queryClient.cancelQueries({ queryKey: [key] })
        const previousData = queryClient.getQueryData<any>([key])

        // Используем пользовательскую функцию обновления если она есть
        if (options?.optimisticUpdate) {
          queryClient.setQueryData([key], (old: any) =>
            options.optimisticUpdate!(old, newData)
          )
        } else {
          queryClient.setQueryData([key], (old: any[] = []) => [newData, ...old])
        }

        context = { previousData } as TContext
      }

      return context
    },

    onError: (error, variables, context) => {
      // Откатываем изменения при ошибке
      if (context && 'previousData' in context) {
        queryClient.setQueryData([key], context.previousData)
      }

      // Вызываем пользовательский обработчик ошибок
      options?.onError?.(error, variables, context)
    },

    onSuccess: (data, variables, context) => {
      // Обновляем кэш при успехе
      queryClient.invalidateQueries({ queryKey: [key] })

      // Вызываем пользовательский обработчик успеха
      options?.onSuccess?.(data, variables, context)
    },

    onSettled: options?.onSettled,
  })
}

// Хук для синхронизации офлайн данных
export function useSyncOfflineData(key: string, syncFn: (data: any) => Promise<any>) {
  const { isOnline } = useNetwork()
  const queryClient = useQueryClient()

  const sync = async () => {
    if (!isOnline) return

    const offlineData = await storage.get<any[]>(`offline_${key}`)
    if (!offlineData?.length) return

    try {
      // Синхронизируем каждый элемент
      for (const data of offlineData) {
        await syncFn(data)
      }

      // Очищаем офлайн данные после успешной синхронизации
      await storage.remove(`offline_${key}`)
      
      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: [key] })
    } catch (error) {
      console.error(`Failed to sync offline data for ${key}:`, error)
    }
  }

  return { sync }
}