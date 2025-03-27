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
    const { locale, updateLocale, isLoading: isLocaleLoading } = useLocale()

    // Флаг для предотвращения зацикленности
    const isSyncingLanguage = useRef(false)

    // Инициализация языка при первом рендере
    useLayoutEffect(() => {
        const initLanguage = async () => {
            try {
                setIsLoading(true)
                const stored = await getStoredLanguage()
                if (stored) {
                    // Устанавливаем язык i18n
                    await i18n.changeLanguage(stored as SupportedLanguage)
                    await setStoredLanguage(stored as SupportedLanguage)
                    setCurrentLanguage(stored as SupportedLanguage)
                }
            } catch (error) {
                console.error('Failed to init language:', error)
            } finally {
                setIsLoading(false)
            }
        }

        initLanguage()
    }, [i18n])

    // Синхронизация с useLocale только при изменении locale
    // и только если это не результат нашего собственного обновления
    useEffect(() => {
        // Пропускаем первый рендер и случаи, когда мы сами инициировали изменение
        if (isLocaleLoading || isSyncingLanguage.current) return

        // Если языки различаются, обновляем currentLanguage
        if (locale !== currentLanguage) {
            setCurrentLanguage(locale as SupportedLanguage)
            i18n.changeLanguage(locale).catch(error => {
                console.error('Failed to sync i18n with locale:', error)
            })
        }
    }, [locale, isLocaleLoading, currentLanguage, i18n])

    // Функция для изменения языка через UI
    const changeLanguage = async (language: SupportedLanguage) => {
        try {
            setIsLoading(true)
            isSyncingLanguage.current = true

            // Обновляем i18n
            await i18n.changeLanguage(language)
            await setStoredLanguage(language)
            setCurrentLanguage(language)

            // Обновляем локаль
            await updateLocale(language as SupportedLocale)
        } catch (error) {
            console.error('Failed to change language:', error)
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
            isLoading: isLoading || isLocaleLoading
        }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)