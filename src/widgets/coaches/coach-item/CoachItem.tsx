import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, View as RNView, TouchableOpacity } from 'react-native'

import LimitedBadgeList from '@features/coaches/LimitedBadgeList'
import { FavoriteButton } from '@features/favorite/FavoriteButton'
import { TruncatedHtmlParser } from '@shared/lib/utils/TruncatedHtmlParser'
import { CoachType } from '@shared/types/coaches/CoachType'
import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'

interface CoachItemProps {
    coach: CoachType
    isLast?: boolean
    main?: boolean
    setHoveredCoach: (id: number | null, position?: { top: number, height: number }) => void
    isHovered?: boolean
    containerRef?: React.RefObject<typeof View>
}

export const CoachItem: React.FC<CoachItemProps> = ({
    coach,
    isLast,
    main = false,
    setHoveredCoach,
    isHovered,
    containerRef
}) => {
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
    const { t } = useTranslation()
    const itemRef = useRef<RNView>(null)

    const navigateToCoach = () => {
        router.push(`/(coach)/${coach.id}`)
    }

    return (
        <View
            ref={itemRef}
            className={`rounded-lg py-4`}
        >
            <View className="flex-row">
                <TouchableOpacity
                    onPress={navigateToCoach}
                    className="w-1/4 mr-3"
                >
                    <View className="aspect-square overflow-hidden rounded-lg">
                        {coach.profile_photo && (
                            <Image
                                source={{ uri: coach.profile_photo }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={navigateToCoach}
                    className="flex-1 justify-top"
                >
                    <View className="flex-row items-center mb-1">
                        <Text
                            weight="medium"
                            size="lg"
                            className="mr-2"
                        >
                            {coach.expert.first_name} {coach.expert.last_name}
                        </Text>
                        {coach.verified && (
                            <Icon
                                name="ShieldCheck"
                                size={16}
                            />
                        )}
                    </View>

                    {/* Цена */}
                    {coach.session_cost && coach.session_cost_currency && (
                        <View>
                            <Text weight="medium">
                                {coach.session_cost} {coach.session_cost_currency}
                            </Text>
                            <Text
                                variant="secondary"
                                size="xs"
                            >
                                {t('coaches.list.item.perSession')}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Кнопка лайка справа */}
                <FavoriteButton coachId={coach.id} mini />
            </View>

            {/* Основная информация */}
            <View>
                <View className="mb-4">
                    <TruncatedHtmlParser
                        html={coach.about_me}
                        maxLines={2}
                    />
                </View>

                {coach.coachType && coach.coachType.length > 0 && (
                    <LimitedBadgeList
                        items={coach.coachType}
                        title={t('coaches.list.item.topics')}
                        limit={2}
                        translatePrefix="coach.coachTypes"
                    />
                )}

                {coach.directions &&
                    Array.isArray(coach.directions) &&
                    coach.directions.length > 0 && (
                        <LimitedBadgeList
                            items={coach.directions}
                            title={t('coaches.list.item.methods')}
                            limit={2}
                            translatePrefix="coach.directions"
                            classContainer="mt-4"
                        />
                    )}


            </View>
        </View>
    )
}