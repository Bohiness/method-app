// src/shared/lib/date/calculateAge.ts
import { differenceInYears, parse } from 'date-fns'
import { useTranslation } from 'react-i18next'

export const useCalculateAge = () => {
    const { t, i18n } = useTranslation()

    const calculateAge = (birthDateString?: string) => {
        if (!birthDateString) return ''

        try {
            const birthDate = parse(birthDateString, 'yyyy-MM-dd', new Date())
            const age = differenceInYears(new Date(), birthDate)

            // Для русского языка используем специальную логику склонения
            if (i18n.language === 'ru') {
                if (age % 10 === 1 && age % 100 !== 11) {
                    return t('common.age.year', { age })
                } else if (
                    [2, 3, 4].includes(age % 10) &&
                    ![12, 13, 14].includes(age % 100)
                ) {
                    return t('common.age.years2to4', { age })
                } else {
                    return t('common.age.years', { age })
                }
            }

            // Для остальных языков используем простую форму
            return t('common.age.years', { age })

        } catch (error) {
            console.error('Error calculating age:', error)
            return ''
        }
    }

    return calculateAge
}
