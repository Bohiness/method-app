import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/styled-text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

const FeatureItem = ({ title, description }: { title: string, description: string }) => (
    <View className="bg-surface dark:bg-surface-dark rounded-2xl p-4 mb-4">
        <Text size="lg" weight="bold" className="mb-2">{title}</Text>
        <Text variant="secondary">{description}</Text>
    </View>
)

export default function ExploreScreen() {
    const { t } = useTranslation()

    const features = [
        {
            title: t('explore.features.smartMatching.title'),
            description: t('explore.features.smartMatching.description')
        },
        {
            title: t('explore.features.videoChat.title'),
            description: t('explore.features.videoChat.description')
        },
        {
            title: t('explore.features.scheduling.title'),
            description: t('explore.features.scheduling.description')
        },
        {
            title: t('explore.features.security.title'),
            description: t('explore.features.security.description')
        }
    ]

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            <ScrollView className="flex-1 px-4 pt-6">
                <View className="items-center mb-2">
                    <View className="rounded-full p-2">
                        <Icon
                            name="Lock"
                            size={40}
                            strokeWidth={1.5}
                        />
                    </View>
                    <Text size="2xl" weight="bold" className="text-center mb-2">
                        {t('explore.comingSoon')}
                    </Text>
                    <Text variant="secondary" className="text-center mb-6">
                        {t('explore.description')}
                    </Text>
                </View>

                {features.map((feature, index) => (
                    <FeatureItem
                        key={index}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </ScrollView>
        </View>
    )
}