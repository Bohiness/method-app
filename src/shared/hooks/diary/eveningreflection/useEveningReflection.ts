import { EveningReflectionSyncService } from '@shared/api/diary/EveningReflectionSyncService';
import { QUERY_KEYS } from '@shared/constants/QUERY_KEYS';
import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal';
import { useNetwork } from '@shared/hooks/systems/network/useNetwork';
import { EveningReflectionStorageService } from '@shared/lib/diary/EveningReflectionStorageService';
import { EveningReflectionType } from '@shared/types/diary/eveningreflection/EveningReflectionType';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const eveningReflectionStorageService = new EveningReflectionStorageService();
const eveningReflectionSyncService = new EveningReflectionSyncService(eveningReflectionStorageService);

// Максимальное количество записей для бесплатной версии
const FREE_REFLECTIONS_LIMIT = 5;

/**
 * Хук для работы с вечерними рефлексиями
 * Предоставляет методы для создания, обновления, удаления и получения рефлексий
 */
export const useEveningReflection = () => {
    const queryClient = useQueryClient();
    const { isOnline } = useNetwork();
    const { checkPremiumAccess } = useSubscriptionModal();
    const { t } = useTranslation();

    const openEveningReflectionModal = async () => {
        // Получаем текущие записи для проверки их количества
        const reflections = await eveningReflectionStorageService.getEveningReflections();

        // Если количество записей больше или равно лимиту, проверяем наличие премиум-подписки
        if (reflections.length >= FREE_REFLECTIONS_LIMIT) {
            const hasPremium = await checkPremiumAccess({
                text: 'subscription.evening_reflection_limit',
            });

            // Если нет премиум-подписки, модальное окно подписки уже показано функцией checkPremiumAccess
            if (!hasPremium) {
                return;
            }
        }

        // Если есть премиум или количество записей меньше лимита, открываем модальное окно создания рефлексии
        router.push('/(modals)/(diary)/evening-reflection');
    };

    // Общая функция для дебаунсированной синхронизации
    const debouncedSync = useMemo(
        () =>
            debounce(async () => {
                try {
                    await eveningReflectionSyncService.syncChanges();
                    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENING_REFLECTION] });
                } catch (error) {
                    console.error('Failed to sync changes:', error);
                }
            }, 1000),
        [queryClient]
    );

    // Мутация для создания новой рефлексии
    const createMutation = useMutation({
        mutationFn: async (data: Omit<EveningReflectionType, 'id' | 'created_at'>) => {
            // Получаем текущие записи для проверки их количества
            const reflections = await eveningReflectionStorageService.getEveningReflections();

            // Если количество записей больше или равно лимиту, проверяем наличие премиум-подписки
            if (reflections.length >= FREE_REFLECTIONS_LIMIT) {
                const hasPremium = await checkPremiumAccess({
                    text: 'subscription.evening_reflection_limit',
                });

                // Если нет премиум-подписки, прерываем создание
                if (!hasPremium) {
                    throw new Error('Premium subscription required');
                }
            }

            // Сохраняем в локальное хранилище
            const newReflection = await eveningReflectionStorageService.createEveningReflection(data);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return newReflection;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENING_REFLECTION] });
        },
    });

    // Мутация для обновления рефлексии
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<EveningReflectionType> }) => {
            // Обновляем в локальном хранилище
            const updatedReflection = await eveningReflectionStorageService.updateEveningReflection(id, data);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return updatedReflection;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENING_REFLECTION] });
        },
    });

    // Мутация для удаления рефлексии
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // Удаляем из локального хранилища
            await eveningReflectionStorageService.deleteEveningReflection(id);

            // Если онлайн, запускаем дебаунсированную синхронизацию
            if (isOnline) {
                debouncedSync();
            }

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENING_REFLECTION] });
        },
    });

    // Функция для получения истории рефлексий
    const getHistory = () => {
        return useQuery<EveningReflectionType[], Error>({
            queryKey: [QUERY_KEYS.EVENING_REFLECTION],
            queryFn: async () => {
                if (isOnline) {
                    try {
                        await eveningReflectionSyncService.syncChanges();
                    } catch (error) {
                        console.error('Failed to sync changes:', error);
                    }
                }
                return eveningReflectionStorageService.getEveningReflections();
            },
        });
    };

    // Функция для получения деталей конкретной рефлексии
    const getDetails = (id: string | undefined) => {
        return useQuery<EveningReflectionType | null, Error>({
            queryKey: [QUERY_KEYS.EVENING_REFLECTION, id],
            queryFn: async () => {
                if (!id) return null;

                if (isOnline) {
                    try {
                        await eveningReflectionSyncService.syncChanges();
                    } catch (error) {
                        console.error('Failed to sync changes:', error);
                    }
                }
                return eveningReflectionStorageService.getEveningReflectionById(id);
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
        openEveningReflectionModal,
    };
};

// Для обратной совместимости оставляем отдельные хуки
export const useCreateEveningReflection = () => {
    const { create } = useEveningReflection();
    return create;
};

export const useUpdateEveningReflection = () => {
    const { update } = useEveningReflection();
    return update;
};

export const useDeleteEveningReflection = () => {
    const { delete: deleteReflection } = useEveningReflection();
    return deleteReflection;
};

export const useEveningReflectionHistory = () => {
    const { getHistory } = useEveningReflection();
    return getHistory();
};

export const useEveningReflectionDetails = (id: string | undefined) => {
    const { getDetails } = useEveningReflection();
    return getDetails(id);
};
