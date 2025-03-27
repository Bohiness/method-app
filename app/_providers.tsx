// src/app/_layout.tsx
import { UserProvider } from '@context/user-provider'
import i18n from '@shared/config/i18n'
import { queryClient } from '@shared/config/query-client'
import { AppSettingsProvider } from '@shared/context/app-settings-context'
import { LanguageProvider } from '@shared/context/language-provider'
import { NotificationProvider } from '@shared/context/notification-provider'
import { ThemeProvider } from '@shared/context/theme-provider'
import { SyncManager } from '@shared/ui/system/sync/SyncManager'
import { ContainerScreen } from '@shared/ui/view'
import {
    QueryClientProvider
} from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-get-random-values'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './global.css'


export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <I18nextProvider i18n={i18n}>
            <GestureHandlerRootView style={{ flex: 1, padding: 0, margin: 0 }}>
                <QueryClientProvider client={queryClient}>
                    <UserProvider>
                        <LanguageProvider>
                            <ThemeProvider>
                                <AppSettingsProvider>
                                    <SafeAreaProvider>
                                        <SyncManager />
                                        <ContainerScreen>
                                            <NotificationProvider>
                                                {children}
                                            </NotificationProvider>
                                        </ContainerScreen>
                                    </SafeAreaProvider>
                                </AppSettingsProvider>
                            </ThemeProvider>
                        </LanguageProvider>
                    </UserProvider>
                </QueryClientProvider>
            </GestureHandlerRootView>
        </I18nextProvider>
    )
}
