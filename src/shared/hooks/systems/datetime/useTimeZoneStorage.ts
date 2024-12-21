// src/shared/hooks/systems/datetime/useTimeZoneStorage.ts
import { useStorage } from '@shared/lib/storage/storage.service'
import { useEffect, useState } from 'react'

interface TimeZoneStorageProps {
  initialTimeZone?: string;
}

export const useTimeZoneStorage = ({ initialTimeZone = 'UTC' }: TimeZoneStorageProps = {}) => {
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const [isLoading, setIsLoading] = useState(true);
  const storage = useStorage();

  useEffect(() => {
    const loadTimeZone = async () => {
      try {
        const storedTimeZone = await storage.get<string>('app-timezone');
        if (storedTimeZone) {
          setTimeZone(storedTimeZone);
        } else {
          // Если временная зона не установлена, пытаемся определить системную
          const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          await storage.set('app-timezone', systemTimeZone);
          setTimeZone(systemTimeZone);
        }
      } catch (error) {
        console.error('Failed to load timezone:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeZone();
  }, []);

  const updateTimeZone = async (newTimeZone: string) => {
    try {
      await storage.set('app-timezone', newTimeZone);
      setTimeZone(newTimeZone);
    } catch (error) {
      console.error('Failed to update timezone:', error);
      throw error;
    }
  };

  return {
    timeZone,
    updateTimeZone,
    isLoading
  };
};