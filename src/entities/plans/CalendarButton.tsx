import { useTranslation } from 'react-i18next'

import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Badge } from '@shared/ui/badge'
import { Pressable } from 'react-native'

export const CalendarButton = ({ date, isActive, onPress, isTimeEnabled }: {
    date?: Date,
    isActive?: boolean,
    onPress: () => void,
    isTimeEnabled?: boolean
}) => {
    const { t } = useTranslation()
    const { formatDateTime } = useDateTime()

    return (
        <Pressable
            onPress={onPress}
        >
            <Badge size='lg'>
                {date && formatDateTime(date, 'dd MMMM')}{isTimeEnabled && ' ' + t('common.date.at')} {isTimeEnabled && date && formatDateTime(date, 'HH:mm')}
            </Badge>
        </Pressable>
    )
}