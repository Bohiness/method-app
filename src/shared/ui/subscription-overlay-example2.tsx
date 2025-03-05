import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import React from 'react'
import { View } from 'react-native'
import { Button } from './button'
import { Text } from './text'

/**
 * Пример использования функции wrapWithSubscriptionOverlay из хука useSubscriptionModal
 */
export const SubscriptionOverlayExample2 = () => {
    const { wrapWithSubscriptionOverlay } = useSubscriptionModal()

    // Пример премиум-функции
    const PremiumFeature = () => (
        <View className="p-5 bg-gray-100 dark:bg-gray-800 rounded-lg h-[150px] justify-center items-center space-y-4">
            <Text className="text-center">Это премиум-функция</Text>
            <Button
                variant="outline"
                onPress={() => console.log('Premium feature used')}
            >
                Использовать премиум-функцию
            </Button>
        </View>
    )

    // Пример AI-функции
    const AIFeature = () => (
        <View className="p-5 bg-gray-100 dark:bg-gray-800 rounded-lg h-[150px] justify-center items-center space-y-4">
            <Text className="text-center">Это AI-функция</Text>
            <Button
                variant="outline"
                onPress={() => console.log('AI feature used')}
            >
                Использовать AI-функцию
            </Button>
        </View>
    )

    return (
        <View className="p-4 space-y-4">
            <Text className="text-lg font-bold mb-4">Примеры использования wrapWithSubscriptionOverlay</Text>

            {/* Пример блокировки премиум-функции */}
            {wrapWithSubscriptionOverlay({
                children: <PremiumFeature />,
                plan: 'premium',
                text: 'subscription.premium_feature_locked',
                className: "rounded-xl overflow-hidden"
            })}

            <View className="h-[1px] bg-gray-200 dark:bg-gray-700 my-4" />

            {/* Пример блокировки AI-функции */}
            {wrapWithSubscriptionOverlay({
                children: <AIFeature />,
                plan: 'premium_ai',
                text: 'subscription.ai_feature_locked',
                opacity: 0.8,
                className: "rounded-xl overflow-hidden"
            })}
        </View>
    )
} 