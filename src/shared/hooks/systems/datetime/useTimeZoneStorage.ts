// src/shared/hooks/systems/datetime/useTimeZoneStorage.ts
import { QUERY_KEYS } from '@shared/constants/system/QUERY_KEYS';
import { useUser } from '@shared/context/user-provider';
import { logger } from '@shared/lib/logger/logger.service';
import { useStorage } from '@shared/lib/storage/storage.service';
import { StorageKeysType } from '@shared/types/user/StorageKeysType';
import { useLayoutEffect, useState } from 'react';

interface TimeZoneStorageProps {
    initialTimeZone?: string;
}

// Используем константу вместо прямого обращения к объекту
const APP_TIMEZONE_KEY = QUERY_KEYS.APP_TIMEZONE as keyof StorageKeysType;

export const useTimeZoneStorage = ({ initialTimeZone = 'UTC' }: TimeZoneStorageProps = {}) => {
    const [timeZone, setTimeZone] = useState(initialTimeZone);
    const [isLoading, setIsLoading] = useState(true);
    const storage = useStorage();
    const { user, updateUser } = useUser();

    const loadTimeZone = async () => {
        setIsLoading(true);
        try {
            // 1. Сначала проверяем таймзону пользователя
            if (user && user?.timezone) {
                updateTimeZone(user.timezone);
                return;
            }
            // 2. Если таймзоны пользователя нет, проверяем хранилище
            const storedTimeZone = await storage.get(APP_TIMEZONE_KEY);
            if (storedTimeZone) {
                await updateTimeZoneAndUser(storedTimeZone as string);
                return;
            }

            // 3. Если в хранилище нет, используем системную таймзону
            const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (systemTimeZone) {
                await updateTimeZoneAndUser(systemTimeZone);
                return;
            }

            // 4. Если ничего не получилось, устанавливаем UTC, но не для пользователя
            await updateTimeZone('UTC');
        } catch (error) {
            logger.error(error, 'Failed to load timezone:');
        } finally {
            setIsLoading(false);
        }
    };

    useLayoutEffect(() => {
        loadTimeZone();
    }, [user]);

    const updateTimeZone = async (newTimeZone: string) => {
        try {
            await storage.set(APP_TIMEZONE_KEY, newTimeZone);
            setTimeZone(newTimeZone);
        } catch (error) {
            logger.error(error, 'Failed to update timezone:');
        }
    };

    const updateTimeZoneAndUser = async (newTimeZone: string) => {
        try {
            await updateTimeZone(newTimeZone);
            await updateUser({ timezone: newTimeZone });
        } catch (error) {
            logger.error(error, 'Failed to update timezone and user:');
        }
    };

    return {
        timeZone,
        updateTimeZone,
        updateTimeZoneAndUser,
        isLoading,
    };
};
