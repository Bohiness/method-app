// src/shared/lib/language-provider/index.tsx
import { getStoredLanguage, setStoredLanguage } from '@shared/config/i18n'
import { useLocale } from '@shared/hooks/systems/locale/useLocale'
import { SupportedLocale } from '@shared/types/locale/types'
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type SupportedLanguage = 'ru' | 'en'

type LanguageContextType = {
    currentLanguage: SupportedLanguage
    changeLanguage: (lang: SupportedLanguage) => Promise<void>
    isInitialized: boolean
}

const LanguageContext = createContext<LanguageContextType>({
    currentLanguage: 'en',
    changeLanguage: async () => { },
    isInitialized: false
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const { i18n } = useTranslation()
    const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(i18n.language as SupportedLanguage)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { locale, updateLocale, isLoading: isLocaleLoading } = useLocale()
    const isSyncingLanguage = useRef(false)

    useLayoutEffect(() => {
        const initLanguage = async () => {
            let initialLang = i18n.language as SupportedLanguage
            try {
                const stored = await getStoredLanguage()
                if (stored && ['ru', 'en'].includes(stored)) {
                    initialLang = stored as SupportedLanguage
                    if (i18n.language !== initialLang) {
                        await i18n.changeLanguage(initialLang)
                    }
                }
                setCurrentLanguage(initialLang)

            } catch (error) {
                console.error('Failed to init language from storage:', error)
                setCurrentLanguage(i18n.language as SupportedLanguage)
            } finally {
                setIsInitialized(true)
            }
        }

        initLanguage()
    }, [])

    useEffect(() => {
        if (!isInitialized || isSyncingLanguage.current || isLocaleLoading) return

        const deviceLocale = locale as SupportedLanguage

        if (['ru', 'en'].includes(deviceLocale) && deviceLocale !== currentLanguage) {
            console.log(`Syncing language to device locale: ${deviceLocale}`)
            changeLanguage(deviceLocale).catch(error => {
                console.error('Failed to auto-sync language with locale:', error)
            })
        }
    }, [locale, isLocaleLoading, isInitialized, currentLanguage])

    const changeLanguage = async (language: SupportedLanguage) => {
        if (!isInitialized) {
            console.warn('Attempted to change language before initialization.')
            return
        }
        if (language === currentLanguage && i18n.language === language) {
            return
        }

        try {
            setIsLoading(true)
            isSyncingLanguage.current = true

            if (i18n.language !== language) {
                await i18n.changeLanguage(language)
            }
            await setStoredLanguage(language)
            setCurrentLanguage(language)

            if (locale !== language) {
                await updateLocale(language as SupportedLocale)
            }

        } catch (error) {
            console.error(`Failed to change language to ${language}:`, error)
            throw error
        } finally {
            setIsLoading(false)
            isSyncingLanguage.current = false
        }
    }

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            changeLanguage,
            isInitialized
        }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}