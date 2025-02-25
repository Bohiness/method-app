// app/(coach)/_layout.tsx
import { CoachShareButton } from '@features/coaches/CoachShareButton'
import { FavoriteButton } from '@features/favorite/FavoriteButton'
import { CoachType } from '@shared/types/coaches/CoachType'
import { CustomHeader } from '@widgets/navigation/CustomHeader'
import { Stack } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

type CoachRouteParams = {
    id: string
    coach: CoachType
}

export default function CoachLayout() {
    const { t } = useTranslation()

    return (
        <Stack>
            <Stack.Screen
                name="coaches"
                options={{
                    header: () => (
                        <CustomHeader
                            title={t('coaches.list.mini.title')}
                            showBackButton
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="booking"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    header: ({ route, navigation }) => {
                        const params = (route.params || {}) as CoachRouteParams
                        const coachID = params.id

                        return (
                            <>
                                <CustomHeader
                                    showBackButton
                                    rightElement={
                                        <View className="flex-row items-center gap-x-2">
                                            <CoachShareButton coachId={+coachID} />
                                            <FavoriteButton coachId={+coachID} mini />
                                        </View>
                                    }
                                />
                            </>
                        )
                    }
                }}
            />
        </Stack>
    )
}