// src/shared/lib/language-provider/index.tsx
import { setStoredLanguage } from '@shared/config/i18n'
import { createContext, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

type LanguageContextType = {
    currentLanguage: string
    changeLanguage: (lang: string) => Promise<void>
}

const LanguageContext = createContext<LanguageContextType>({
    currentLanguage: 'ru',
    changeLanguage: async () => { },
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const { i18n } = useTranslation()
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

    const changeLanguage = async (language: string) => {
        await i18n.changeLanguage(language)
        await setStoredLanguage(language)
        setCurrentLanguage(language)
    }

    return (
        <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    )
}
