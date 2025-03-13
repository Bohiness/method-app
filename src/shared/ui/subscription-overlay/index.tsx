import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { SubscriptionOverlayProps } from './types'

/**
 * Компонент, который показывает оверлей с предложением подписки
 * поверх заблокированного контента
 */
export const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({
    children,
    plan,
    text
}) => {
    const { t } = useTranslation()

    const handleSubscribe = () => {
        router.push({
            pathname: '/(modals)/(payment)/subscription',
            params: {
                text: text || t('subscription.feature_locked'),
                selectedPlan: plan
            }
        })
    }

    return (
        <View className="relative">
            {/* Затемненный контент */}
            <View className="opacity-30">
                {children}
            </View>

            {/* Оверлей с предложением подписки */}
            <View className="absolute inset-0 items-center justify-center p-6 bg-black/30">
                <View className="bg-surface-paper dark:bg-surface-paper-dark p-6 rounded-2xl w-full max-w-xs">
                    <Text className="text-center font-semibold mb-4">
                        {text || t('subscription.feature_locked')}
                    </Text>

                    <Button onPress={handleSubscribe} className="mb-2">
                        {t('subscription.subscribe_button')}
                    </Button>

                    <Button variant="ghost" onPress={() => router.back()}>
                        {t('common.cancel')}
                    </Button>
                </View>
            </View>
        </View>
    )
}

export * from './types'
