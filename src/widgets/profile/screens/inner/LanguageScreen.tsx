import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { SupportedLanguage, useLanguage } from '@shared/context/language-provider'
import { ScreenType } from '@shared/hooks/modal/useScreenNavigation'
import { RadioGroup } from '@shared/ui/radio'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const LanguageScreen = ({ onBack, onNavigate }: {
    onBack: () => void,
    onNavigate: (screen: ScreenType) => void
}) => {
    const { t } = useTranslation()
    const { currentLanguage, changeLanguage, isLoading } = useLanguage()
    const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage)

    useEffect(() => {
        setSelectedLanguage(currentLanguage)
    }, [currentLanguage])

    const languageOptions = [
        { label: t("settings.language.english"), value: 'en' },
        { label: t("settings.language.russian"), value: 'ru' },
    ]

    const handleLanguageChange = async (value: SupportedLanguage) => {
        try {
            await changeLanguage(value)
        } catch (error) {
            console.error('Failed to change language:', error)
        }
    }

    return (
        <View>
            <HeaderMenuItem onBack={onBack} title={t('settings.language.title')} />

            <RadioGroup
                options={languageOptions}
                value={selectedLanguage}
                onChange={handleLanguageChange as (value: string) => void}
                label={t("settings.language.description")}
                disabled={isLoading}
            />
        </View>
    )
}