// src/shared/hooks/settings/useSettings.ts
import { useUser } from '@shared/context/user-provider'
import { settingsService } from '@shared/lib/setting/settings.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useSettings() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Запрос текущих настроек
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: Infinity,
  })

  // Мутация для обновления настроек
  const { mutateAsync: updateSettings } = useMutation({
    mutationFn: (newSettings: Partial<AppSettings>) => 
      settingsService.updateSettings(newSettings, user),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings)
    },
  })

  return {
    settings: settings || {
      theme: 'system',
      language: 'ru',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    } as AppSettings,
    isLoading,
    updateSettings
  }
}
