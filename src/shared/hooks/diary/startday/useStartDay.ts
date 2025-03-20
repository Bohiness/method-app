import { StartDaySyncService } from '@shared/api/diary/StartDaySyncService';
import { QUERY_KEYS } from '@shared/constants/QUERY_KEYS';
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { StartDayStorageService } from '@shared/lib/diary/StartData.storage-service';
import { StartDayType } from '@shared/types/diary/startday/StartDayType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';

const startDayStorageService = new StartDayStorageService();
const startDaySyncService = new StartDaySyncService(startDayStorageService);

// Максимальное количество записей для бесплатной версии
const FREE_STARTDAY_LIMIT = 5;

/**
 * Хук для работы с записями начала дня
 * Предоставляет методы для создания, обновления, удаления и получения записей
 */
export const useStartDay = () => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();
    const { checkPremiumAccess } = useSubscriptionModal();

    const openStartDayModal = async () => {
        // Получаем текущие записи для проверки их количества
        const startDays = await startDayStorageService.getStartDays();

        // Если количество записей больше или равно лимиту, проверяем наличие премиум-подписки
        if (startDays.length >= FREE_STARTDAY_LIMIT) {
            const hasPremium = await checkPremiumAccess({
                text: 'subscription.start_day_limit',
            });

            // Если нет премиум-подписки, модальное окно подписки уже показано функцией checkPremiumAccess
            if (!hasPremium) {
                return;
            }
        }

        // Если есть премиум или количество записей меньше лимита, открываем модальное окно создания записи
        router.push('/(modals)/(diary)/start-your-day');
    };

    // Общая функция для дебаунсированной синхронизации
    const debouncedSync = useMemo(
        () =>
            debounce(async () => {
                try {
                    await startDaySyncService.syncChanges();
                    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.START_DAY] });
                } catch (error) {
                    console.error('Failed to sync changes:', error);
                }
            }, 1000),
        [queryClient]
    );

    // Мутация для создания новой записи
    const createMutation = useMutation({
        mutationFn: async (data: Omit<StartDayType, 'id' | 'created_at'>) => {
            // Получаем текущие записи для проверки их количества
            const startDays = await startDayStorageService.getStartDays();

            // Если количество записей больше или равно лимиту, проверяем наличие премиум-подписки
            if (startDays.length >= FREE_STARTDAY_LIMIT) {
                const hasPremium = await checkPremiumAccess({
                    text: 'subscription.start_day_limit',
                });

                // Если нет премиум-подписки, прерываем создание
                if (!hasPremium) {
                    throw new Error('Premium subscription required');
                }
            }

            // Сохраняем в локальное хранилище
            const newStartDay = await startDayStorageService.createStartDay(data);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return newStartDay;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.START_DAY] });
        },
    });

    // Мутация для обновления записи начала дня
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<StartDayType> }) => {
            // Обновляем в локальном хранилище
            const updatedStartDay = await startDayStorageService.updateStartDay(id, data);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return updatedStartDay;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.START_DAY] });
        },
    });

    // Мутация для удаления записи начала дня
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // Удаляем из локального хранилища
            await startDayStorageService.deleteStartDay(id);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.START_DAY] });
        },
    });

    // Функция для получения истории записей начала дня
    const getHistory = () => {
        return useQuery<StartDayType[], Error>({
            queryKey: [QUERY_KEYS.START_DAY],
            queryFn: async () => {
                if (isOnline) {
                    try {
                        await startDaySyncService.syncChanges();
                    } catch (error) {
                        console.error('Failed to sync changes:', error);
                    }
                }
                return startDayStorageService.getStartDays();
            },
        });
    };

    // Функция для получения деталей конкретной записи начала дня
    const getDetails = (id: string | undefined) => {
        return useQuery<StartDayType | null, Error>({
            queryKey: [QUERY_KEYS.START_DAY, id],
            queryFn: async () => {
                if (!id) return null;

                if (isOnline) {
                    try {
                        await startDaySyncService.syncChanges();
                    } catch (error) {
                        console.error('Failed to sync changes:', error);
                    }
                }
                return startDayStorageService.getStartDayById(id);
            },
            enabled: !!id,
        });
    };

    // Возвращаем все функции как единый объект
    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        getHistory,
        getDetails,
        openStartDayModal,
    };
};

// Для обратной совместимости оставляем отдельные хуки
export const useCreateStartDay = () => {
    const { create } = useStartDay();
    return create;
};

export const useUpdateStartDay = () => {
    const { update } = useStartDay();
    return update;
};

export const useDeleteStartDay = () => {
    const { delete: deleteStartDay } = useStartDay();
    return deleteStartDay;
};

export const useStartDayHistory = () => {
    const { getHistory } = useStartDay();
    return getHistory();
};

export const useStartDayDetails = (id: string | undefined) => {
    const { getDetails } = useStartDay();
    return getDetails(id);
};
