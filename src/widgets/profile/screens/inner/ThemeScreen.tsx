// ThemeScreen.tsx
import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useTheme } from '@shared/context/theme-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { RadioGroup } from '@shared/ui/radio'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

type ThemeOption = 'system' | 'light' | 'dark'

export const ThemeScreen = ({
    onBack,
    onNavigate
}: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()
    const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(theme)

    const themeOptions = [
        { label: t("settings.theme.automatic"), value: 'system' },
        { label: t("settings.theme.light"), value: 'light' },
        { label: t("settings.theme.dark"), value: 'dark' }
    ]

    // Обработчик изменения темы
    const handleThemeChange = async (value: string) => {
        const newTheme = value as ThemeOption
        setSelectedTheme(newTheme)
        try {
            await setTheme(newTheme)
        } catch (error) {
            console.error('Failed to update theme:', error)
            // Возвращаем предыдущее значение в случае ошибки
            setSelectedTheme(theme)
        }
    }

    // Синхронизируем локальное состояние с глобальной темой
    useEffect(() => {
        setSelectedTheme(theme)
    }, [theme])

    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('settings.theme.title')} />

            <RadioGroup
                options={themeOptions}
                value={selectedTheme}
                onChange={handleThemeChange}
                label={t("settings.theme.description")}
            />

            {/* <ThemeDebug /> */}

        </View>
    )
}