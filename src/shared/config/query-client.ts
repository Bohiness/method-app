import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 60 * 1000 * 24 * 30,
            retry: 1,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnReconnect: true,
            refetchOnMount: true,
            gcTime: Infinity,
        },
        mutations: {
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            networkMode: 'offlineFirst',
        },
    },
});
