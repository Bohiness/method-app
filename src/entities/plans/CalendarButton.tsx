import { useTranslation } from 'react-i18next'

import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Button } from '@shared/ui/button'


export const CalendarButton = ({ date, isActive, onPress, isTimeEnabled }: {
    date?: Date,
    isActive?: boolean,
    onPress: () => void,
    isTimeEnabled?: boolean
}) => {
    const { t } = useTranslation()
    const { formatDateTime } = useDateTime()

    return (
        <Button size='sm' variant='outline' onPress={onPress}>
            {date && formatDateTime(date, 'dd MMMM')}{isTimeEnabled && ' ' + t('common.date.at')} {isTimeEnabled && date && formatDateTime(date, 'HH:mm')}
        </Button>
    )
}