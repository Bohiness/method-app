import { useTranslation } from 'react-i18next'
import { Alert, AlertTitle } from '../alert'

export const NotOnline = () => {
    const { t } = useTranslation()

    return (
        <Alert variant='destructive'>
            <AlertTitle >
                {t('common.offlineMode')}
            </AlertTitle>
        </Alert>
    )
}