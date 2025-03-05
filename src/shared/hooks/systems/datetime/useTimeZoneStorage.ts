// src/shared/hooks/systems/datetime/useTimeZoneStorage.ts
import { QUERY_KEYS } from '@shared/constants/QUERY_KEYS';
import { useUser } from '@shared/context/user-provider';
import { useStorage } from '@shared/lib/storage/storage.service';
import { StorageKeysType } from '@shared/types/user/StorageKeysType';
import { useEffect, useState } from 'react';

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

    useEffect(() => {
        const loadTimeZone = async () => {
            try {
                // 1. Сначала проверяем таймзону пользователя
                if (user?.timezone) {
                    setTimeZone(user.timezone);
                    await storage.set(APP_TIMEZONE_KEY, user.timezone);
                } else {
                    // 2. Если таймзоны пользователя нет, проверяем хранилище
                    const storedTimeZone = await storage.get(APP_TIMEZONE_KEY);
                    if (storedTimeZone) {
                        setTimeZone(storedTimeZone as string);
                        await updateUser({ timezone: storedTimeZone as string });
                    } else {
                        // 3. Если в хранилище нет, используем системную таймзону
                        const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        await storage.set(APP_TIMEZONE_KEY, systemTimeZone);
                        setTimeZone(systemTimeZone);
                        await updateUser({ timezone: systemTimeZone });
                    }
                }
            } catch (error) {
                console.error('Failed to load timezone:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTimeZone();
    }, [user]); // Добавляем user в зависимости, чтобы эффект срабатывал при изменении пользователя

    const updateTimeZone = async (newTimeZone: string) => {
        try {
            await storage.set(APP_TIMEZONE_KEY, newTimeZone);
            setTimeZone(newTimeZone);
        } catch (error) {
            console.error('Failed to update timezone:', error);
        }
    };

    return {
        timeZone,
        updateTimeZone,
        isLoading,
    };
};
