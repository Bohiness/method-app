// src/shared/hooks/useLocale.ts
import { useStorage } from '@shared/lib/storage/storage.service'
import { SupportedLocale } from '@shared/types/locale/types'
import { useEffect, useState } from 'react'

interface LocaleStorageProps {
  initialLocale?: SupportedLocale;
}

export const useLocale = ({ initialLocale = 'ru' }: LocaleStorageProps = {}) => {
  const [locale, setLocale] = useState<SupportedLocale>(initialLocale);
  const [isLoading, setIsLoading] = useState(true);
  const [hour12, setHour12] = useState(true);
  const storage = useStorage();

  useEffect(() => {
    const loadLocale = async () => {
      try {
        const storedLocale = await storage.get<SupportedLocale>('app-locale');
        if (storedLocale) {
          setLocale(storedLocale);
        } else {
          // Если временная зона не установлена, пытаемся определить системную
          const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
          await storage.set('app-locale', systemLocale);
          setLocale(systemLocale);
        }
      } catch (error) {
        console.error('Failed to load locale:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocale();
  }, []);

  const updateLocale = async (newLocale: SupportedLocale) => {
    try {
      await storage.set('app-locale', newLocale);
      setLocale(newLocale);
    } catch (error) {
      console.error('Failed to update locale:', error);
      throw error;
    }
  };

  return {
    locale,
    hour12,
    setHour12,
    updateLocale,
    isLoading,
  };
};
