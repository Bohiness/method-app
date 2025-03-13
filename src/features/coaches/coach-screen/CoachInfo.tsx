// src/widgets/coach/CoachProfile/CoachInfo.tsx
import { useCalculateAge } from '@shared/lib/utils/coach/calculateAge'
import { Icon } from '@shared/ui/icon'
import { ExpandableImage } from '@shared/ui/image/ExpandableImage'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React from 'react'

interface CoachHeaderProps {
    image: string
    first_name: string
    last_name: string
    verified: boolean
    country: string
    date_of_birth: string
    marital_status: string
}

export const CoachInfo = ({
    image,
    first_name,
    last_name,
    verified,
    country,
    date_of_birth,
    marital_status,
}: CoachHeaderProps) => {
    const calculateAge = useCalculateAge()

    return (
        <View className="p-4">
            <View className="flex-row gap-x-4">
                <ExpandableImage
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 100,
                    }}
                    source={{ uri: image }}
                    className="rounded-2xl"
                />

                <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-1">
                        <Title
                            weight="medium"
                            className="mr-2"
                        >
                            {first_name} {last_name}
                        </Title>
                        {verified && (
                            <Icon
                                name="ShieldCheck"
                                size={16}
                            />
                        )}
                    </View>

                    <View className="flex-row items-center">
                        <Text
                            variant="secondary"
                        >
                            {`${country && `${country}, `}${calculateAge(date_of_birth)}, ${marital_status}`}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}