import { useCoaches } from '@shared/hooks/coaches/useCoach'
import { Separator } from '@shared/ui/separator'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { CoachItem } from '../coach-item/CoachItem'
import { CoachListSkeleton } from '../coach-item/CoachItemSkeleton'

interface CoachesWidgetsProps {
    showTitle?: boolean
    limit?: number
}

export const CoachesWidgets = ({ showTitle = true, limit }: CoachesWidgetsProps) => {
    const { t } = useTranslation()
    const { coaches, isPending } = useCoaches()
    const [hoveredCoach, setHoveredCoach] = useState<{ id: number | null, position?: { top: number, height: number } }>({ id: null })

    if (isPending) {
        return <CoachListSkeleton count={limit} />
    }

    return (
        <View className='flex-1'>
            {showTitle &&
                <Title onPress={() => { router.push('/coaches') }}>
                    {t('coaches.list.mini.title')}{' '}
                    <Text weight="bold" variant="secondary">({coaches.length})</Text>
                </Title>
            }
            <ScrollView className="mb-2 flex-1">
                <View className="flex-row flex-wrap gap-2">
                    {coaches && coaches.slice(0, limit).map((coach, index) => (
                        <>
                            <CoachItem
                                key={coach.id}
                                coach={coach}
                                setHoveredCoach={(id, position) => setHoveredCoach({ id, position })}
                                isHovered={hoveredCoach.id === coach.id}
                            />
                            {index < coaches.length - 1 && <Separator key={coach.id + 'separator'} />}
                        </>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}