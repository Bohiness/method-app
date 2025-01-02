import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { RadioGroup } from '@shared/ui/radio-group-button'
import { ScreenType } from '@widgets/profile/SettingModal'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'


export const LanguageScreen = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (screen: ScreenType) => void }) => {
    const { t } = useTranslation()
    const [selectedLanguage, setSelectedLanguage] = useState('en')

    const languageOptions = [
        { label: t("settings.language.english"), value: 'en' },
        { label: t("settings.language.russian"), value: 'ru' },
    ]

    return (
        <View>
            <HeaderMenuItem onBack={onBack} title={t('settings.language.title')} />

            <RadioGroup
                options={languageOptions}
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                label={t("settings.language.description")}
            />

        </View>
    )
}