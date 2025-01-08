import { useNavigation } from '@react-navigation/native'
import { CheckCircle2, MessageSquare } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, TouchableOpacity, View } from 'react-native'

import LimitedBadgeList from '@features/coaches/LimitedBadgeList'
import { FavoriteButton } from '@features/favorite/FavoriteButton'
import { TruncatedHtmlParser } from '@shared/lib/utils/TruncatedHtmlParser'
import { CoachType } from '@shared/types/coaches/CoachType'
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'

interface CoachItemProps {
    coach: CoachType
    isLast?: boolean
    main?: boolean
    setHoveredCoach: (id: number | null, position?: { top: number, height: number }) => void
    isHovered?: boolean
    containerRef?: React.RefObject<View>
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
    const itemRef = useRef<View>(null)
    const navigation = useNavigation()

    // Функция для навигации к профилю коуча
    const navigateToCoach = () => {
        navigation.navigate('CoachProfile', { id: coach.id })
    }

    // Функция для навигации к бронированию
    const navigateToBooking = () => {
        navigation.navigate('CoachProfile', {
            id: coach.id,
            screen: 'bookSession'
        })
    }

    return (
        <View
            ref={itemRef}
            className={`rounded-lg border p-4 ${isHovered ? 'border-primary' : 'border-gray-200'}`}
        >
            <View className="flex-row gap-3">
                {/* Фото профиля */}
                <View className="flex-3">
                    <TouchableOpacity onPress={navigateToCoach}>
                        <View className="relative overflow-hidden rounded-lg aspect-square">
                            {coach.profile_photo && (
                                <Image
                                    source={{ uri: coach.profile_photo }}
                                    className="absolute inset-0"
                                    resizeMode="cover"
                                />
                            )}
                        </View>
                    </TouchableOpacity>

                    {coach.verified && (
                        <View className="hidden-sm flex-row items-center mt-2">
                            <CheckCircle2 className="text-primary mr-2" size={16} />
                            <Text variant="secondary" size="sm">
                                {t('specialistVerified')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Информация о коуче */}
                <View className="flex-6">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 pr-2">
                            <TouchableOpacity onPress={navigateToCoach}>
                                <Text weight="medium" size="xl">
                                    {coach.expert.first_name} {coach.expert.last_name}
                                </Text>
                            </TouchableOpacity>

                            {coach.verified && (
                                <View className="flex-row items-center mt-1 sm:hidden">
                                    <CheckCircle2 className="text-primary mr-1" size={16} />
                                    <Text variant="secondary" size="xs">
                                        {t('specialistVerified')}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <FavoriteButton coachId={coach.id} mini className="md:hidden" />
                    </View>

                    {/* Цена для мобильных */}
                    {coach.session_cost && coach.session_cost_currency && (
                        <View className="md:hidden">
                            <Text weight="medium" size="lg">
                                {coach.session_cost} {coach.session_cost_currency}
                            </Text>
                            <Text variant="secondary" size="xs">
                                {t('perSession')}
                            </Text>
                        </View>
                    )}

                    {/* Теги и описание */}
                    <View className="mt-4">
                        {coach.coachType && coach.coachType.length > 0 && (
                            <LimitedBadgeList
                                items={coach.coachType}
                                title={t('topics')}
                                limit={2}
                            />
                        )}

                        {coach.directions &&
                            Array.isArray(coach.directions) &&
                            coach.directions.length > 0 && (
                                <LimitedBadgeList
                                    items={coach.directions}
                                    title={t('methods')}
                                    limit={2}
                                />
                            )}

                        <TruncatedHtmlParser className="text-sm" html={coach.about_me} />
                    </View>
                </View>
            </View>

            {/* Кнопки действий */}
            {!main && (
                <View className="mt-4 flex-row gap-2">
                    <TouchableOpacity
                        className="size-10 items-center justify-center border border-gray-200 rounded-lg"
                        onPress={() => setIsMessageModalOpen(true)}
                    >
                        <MessageSquare size={20} />
                    </TouchableOpacity>

                    <Button
                        className="flex-1"
                        onPress={navigateToBooking}
                    >
                        {t('chooseSpecialist')}
                    </Button>
                </View>
            )}

        </View>
    )
}