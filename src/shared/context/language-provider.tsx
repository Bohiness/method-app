// src/shared/lib/language-provider/index.tsx
import { getStoredLanguage, setStoredLanguage } from '@shared/config/i18n'
import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type SupportedLanguage = 'ru' | 'en'

type LanguageContextType = {
    currentLanguage: SupportedLanguage
    changeLanguage: (lang: SupportedLanguage) => Promise<void>
    isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType>({
    currentLanguage: 'en',
    changeLanguage: async () => { },
    isLoading: true
})


export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const { i18n } = useTranslation()
    const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(i18n.language as SupportedLanguage)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        initLanguage()
    }, [])

    const initLanguage = async () => {
        try {
            const stored = await getStoredLanguage()
            if (stored) {
                await changeLanguage(stored as SupportedLanguage)
            }
        } catch (error) {
            console.error('Failed to init language:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const changeLanguage = async (language: SupportedLanguage) => {
        try {
            setIsLoading(true)
            await i18n.changeLanguage(language)
            await setStoredLanguage(language)
            setCurrentLanguage(language)
        } catch (error) {
            console.error('Failed to change language:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <LanguageContext.Provider value={{ currentLanguage, changeLanguage, isLoading }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)