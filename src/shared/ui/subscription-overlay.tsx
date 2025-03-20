import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { View } from '@shared/ui/view'
import { BlurView } from 'expo-blur'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './button'
import { Text } from './text'

interface SubscriptionOverlayProps {
    children: ReactNode
    plan?: SubscriptionPlan
    text?: string
    isVisible?: boolean
    opacity?: number
    className?: string
    onSubscribe?: (params: { text: string, plan: SubscriptionPlan }) => void
}

/**
 * Компонент оверлея для блокировки функций, требующих подписки
 * Накладывает полупрозрачный слой на компонент с кнопкой для покупки подписки
 */
export const SubscriptionOverlay = ({
    children,
    plan = 'premium',
    text = 'subscription.feature_locked',
    isVisible = true,
    opacity = 0.9,
    className,
    onSubscribe
}: SubscriptionOverlayProps) => {
    const { isDark } = useTheme()
    const { t } = useTranslation()

    const handleSubscribe = () => {
        if (onSubscribe) {
            onSubscribe({
                text: t(text),
                plan
            })
        }
    }

    return (
        <View className={cn("relative overflow-hidden", className)}>
            {children}

            {isVisible && (
                <View
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden"
                    style={{ opacity }}
                >
                    <BlurView
                        className="absolute inset-0"
                        intensity={100}
                        tint={isDark ? 'dark' : 'light'}
                    />
                    <View
                        className={cn("w-4/5 p-5 rounded-2xl")}
                    >
                        <Text
                            className={cn("text-center mb-4")}
                        >
                            {t(text)}
                        </Text>
                        <Button
                            variant="default"
                            onPress={handleSubscribe}
                            className="min-w-[200px] self-center"
                        >
                            {t('subscription.subscribe_now')}
                        </Button>
                    </View>
                </View>
            )}
        </View>
    )
} 