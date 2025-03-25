import { Image } from '@shared/ui/image';

/**
 * Кэш для хранения предзагруженных URL аватаров
 */
const preloadedAvatars = new Set<string>();

/**
 * Утилита для предварительной загрузки аватаров
 */
export const AvatarPreloader = {
    /**
     * Предзагрузить один аватар
     * @param url URL аватара для предзагрузки
     * @returns Промис, который резолвится в true, если загрузка успешна
     */
    preloadAvatar: async (url: string): Promise<boolean> => {
        if (!url || preloadedAvatars.has(url)) {
            return true;
        }

        try {
            const success = await Image.prefetch(url);
            if (success) {
                preloadedAvatars.add(url);
            }
            return success;
        } catch (error) {
            console.error('Error preloading avatar:', error);
            return false;
        }
    },

    /**
     * Предзагрузить массив аватаров
     * @param urls Массив URL аватаров для предзагрузки
     * @returns Промис, который резолвится когда все аватары загружены
     */
    preloadAvatars: async (urls: string[]): Promise<void> => {
        if (!urls || urls.length === 0) {
            return;
        }

        const uniqueUrls = urls.filter(url => url && !preloadedAvatars.has(url));

        if (uniqueUrls.length === 0) {
            return;
        }

        try {
            await Promise.all(uniqueUrls.map(url => AvatarPreloader.preloadAvatar(url)));
        } catch (error) {
            console.error('Error preloading avatars:', error);
        }
    },

    /**
     * Очистить кэш предзагруженных аватаров
     */
    clearCache: (): void => {
        preloadedAvatars.clear();
    },

    /**
     * Проверить, предзагружен ли аватар
     * @param url URL аватара для проверки
     * @returns true, если аватар уже предзагружен
     */
    isPreloaded: (url: string): boolean => {
        return preloadedAvatars.has(url);
    },
};
