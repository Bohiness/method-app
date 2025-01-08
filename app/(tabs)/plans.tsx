import { Icon } from '@shared/ui/icon'
import { Text } from '@shared/ui/text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

const FeatureItem = ({ title, description }: { title: string, description: string }) => (
    <View className="bg-surface-paper dark:bg-surface-paper-dark rounded-2xl p-4 mb-4">
        <Text size="lg" weight="bold" className="mb-2">{title}</Text>
        <Text variant="secondary">{description}</Text>
    </View>
)

export default function PlansScreen() {
    const { t } = useTranslation()

    const features = [
        {
            title: t('plans.features.calendarSync.title'),
            description: t('plans.features.calendarSync.description')
        },
        {
            title: t('plans.features.taskManagement.title'),
            description: t('plans.features.taskManagement.description')
        },
        {
            title: t('plans.features.goalAlignment.title'),
            description: t('plans.features.goalAlignment.description')
        },
        {
            title: t('plans.features.habitTracker.title'),
            description: t('plans.features.habitTracker.description')
        },
        {
            title: t('plans.features.aiAssistant.title'),
            description: t('plans.features.aiAssistant.description')
        }
    ]

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            <ScrollView className="flex-1 px-4">
                <View className="items-center mb-2">
                    <View className="rounded-full p-2">
                        <Icon
                            name="Lock"
                            size={40}
                            strokeWidth={1.5}
                        />
                    </View>
                    <Text size="2xl" weight="bold" className="text-center mb-2">
                        {t('plans.comingSoon')}
                    </Text>
                    <Text variant="secondary" className="text-center mb-6">
                        {t('plans.description')}
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