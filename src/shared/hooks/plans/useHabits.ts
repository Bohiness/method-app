import { habitsApiService } from '@shared/api/plans/habits-api.service';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { habitsStorageService } from '@shared/lib/plans/habits-storage.service';
import { storage } from '@shared/lib/storage/storage.service';
import { CreateHabitDtoType, HabitFiltersType, UpdateHabitDtoType } from '@shared/types/plans/HabitTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useHabits = (filters?: HabitFiltersType) => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();
    const queryKey = ['habits', filters];
    const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

    const {
        data: habits,
        isLoading,
        error,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            const localHabits = await habitsStorageService.getHabits(filters);
            if (isOnline) {
                syncHabits().catch(console.error);
            }
            return localHabits;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    });

    const syncHabits = async () => {
        if (!isOnline) return;
        try {
            // Обрабатываем очередь синхронизации из локального хранилища
            const syncQueue = await habitsStorageService.getSyncQueue();
            for (const operation of syncQueue) {
                try {
                    switch (operation.type) {
                        case 'create':
                            if (operation.data) {
                                await habitsApiService.createHabit(operation.data as CreateHabitDtoType);
                            }
                            break;
                        case 'update':
                            if (operation.id && operation.data) {
                                await habitsApiService.updateHabit(operation.id, operation.data as UpdateHabitDtoType);
                            }
                            break;
                        case 'delete':
                            if (operation.id) {
                                await habitsApiService.deleteHabit(operation.id);
                            }
                            break;
                        case 'complete':
                            if (operation.id) {
                                await habitsApiService.completeHabit(operation.id);
                            }
                            break;
                    }
                } catch (error) {
                    console.error('Sync operation failed:', error);
                }
            }

            // Получаем свежие данные с сервера
            const serverHabits = await habitsApiService.getHabits(filters);
            await storage.set('offline_habits', serverHabits.results);
            await habitsStorageService.clearSyncQueue();

            // Обновляем кэш React Query
            queryClient.setQueryData(queryKey, serverHabits.results);
        } catch (error) {
            console.error('Habits sync failed:', error);
        }
    };

    useEffect(() => {
        if (isOnline) {
            syncHabits();
        }
    }, [isOnline]);

    // Мутация для создания привычки
    const createHabit = useMutation({
        mutationFn: async (data: CreateHabitDtoType) => {
            const newHabit = await habitsStorageService.createHabit(data);
            if (isOnline) {
                try {
                    await syncHabits();
                } catch (error) {
                    console.error('Failed to sync after create:', error);
                }
            }
            return newHabit;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Мутация для обновления привычки
    const updateHabit = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateHabitDtoType }) => {
            const updatedHabit = await habitsStorageService.updateHabit(id, data);
            if (isOnline) {
                try {
                    await syncHabits();
                } catch (error) {
                    console.error('Failed to sync after update:', error);
                }
            }
            return updatedHabit;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Мутация для удаления привычки
    const deleteHabit = useMutation({
        mutationFn: async (id: number) => {
            await habitsStorageService.deleteHabit(id);
            if (isOnline) {
                try {
                    await syncHabits();
                } catch (error) {
                    console.error('Failed to sync after delete:', error);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Мутация для завершения (выполнения) привычки для текущего периода.
    // При необходимости можно передать значение ease_rating.
    const completeHabit = useMutation({
        mutationFn: async ({ habitId, easeRating }: { habitId: number; easeRating?: number }) => {
            const completedHabit = await habitsStorageService.completeHabit(habitId);
            if (isOnline) {
                try {
                    await habitsApiService.completeHabit(habitId, easeRating);
                    await syncHabits();
                } catch (error) {
                    console.error('Failed to sync after complete:', error);
                }
            }
            return completedHabit;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const onChangeSelectedHabit = (id: number | null) => {
        setSelectedHabitId(id);
    };

    return {
        habits,
        isLoading,
        error,
        isOnline,
        createHabit,
        updateHabit,
        deleteHabit,
        completeHabit,
        syncHabits,
        selectedHabitId,
        onChangeSelectedHabit,
    };
};
