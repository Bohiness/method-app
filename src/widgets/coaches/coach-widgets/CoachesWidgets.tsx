import { useCoaches } from '@shared/hooks/coaches/useCoach'
import { Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CoachItem } from '../coach-item/CoachItem'

export const CoachesWidgets = () => {
    const { t } = useTranslation()
    const { coaches } = useCoaches()
    const [hoveredCoach, setHoveredCoach] = useState<{ id: number | null, position?: { top: number, height: number } }>({ id: null })

    return (
        <View>
            <Title>{t('coaches.list.mini.title')} ({coaches.length})</Title>
            {coaches && coaches.map((coach) => (
                <CoachItem
                    key={coach.id}
                    coach={coach}
                    setHoveredCoach={(id, position) => setHoveredCoach({ id, position })}
                    isHovered={hoveredCoach.id === coach.id}
                />
            ))}
        </View>
    )
}