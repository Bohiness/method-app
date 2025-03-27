import { useSubscriptionModal } from '@shared/hooks/subscription/useSubscriptionModal'
import { useVoiceInput } from '@shared/hooks/voice/useVoiceInput'
import { logger } from '@shared/lib/logger/logger.service'
import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { Button } from '../button'
import { Icon } from '../icon'

interface VoiceInputButtonProps {
    onTranscribe: (text: any) => void
    size?: 'xs' | 'sm' | 'md' | 'lg'
    className?: string
    asButton?: boolean
    initialText?: string
    url?: string
}

export const VoiceInputButton = ({
    onTranscribe,
    size = 'md',
    className,
    asButton = false,
    initialText = '',
    url,
}: VoiceInputButtonProps) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const { checkPremiumAIAccess } = useSubscriptionModal()

    const {
        isRecording,
        isProcessing,
        audioLevel,
        startRecording,
        stopRecording,
    } = useVoiceInput({
        enabled: true,
        url
    })

    const pulseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: innerScale }]
        }
    })

    const handlePress = async () => {
        // TODO: Добавить проверку на премиум доступ
        const hasAccess = await checkPremiumAIAccess({
            text: 'subscription.feature_locked',
        })
        if (!hasAccess) {
            return
        }
        if (!isInitialized) {
            setIsInitialized(true)
            await startRecording()
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            return
        }

        if (isRecording) {
            try {
                const result = await stopRecording()

                logger.log(result, 'VoiceInputButton – handlePress', 'result')

                if (result) {
                    onTranscribe(result)
                }
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            } catch (error) {
                logger.error(error, 'VoiceInputButton – handlePress', 'Ошибка при остановке записи:')
            }
        } else {
            try {
                await startRecording()
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            } catch (error) {
                logger.error(error, 'VoiceInputButton – handlePress', 'Ошибка при начале новой записи:')
            }
        }
    }

    const iconSizes = { xs: 16, sm: 18, md: 20, lg: 22 }
    const buttonSizes = { xs: 'w-6 h-6', sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-14 h-14' }
    const innerScale = 1 + 0.5 * audioLevel

    const IconWithPulse = () => (
        <View className="flex items-center justify-center">
            <View
                className={cn(
                    "absolute rounded-full",
                    isRecording ? "bg-error/20" : "transparent",
                )}
                style={{
                    width: iconSizes[size] * 2,
                    height: iconSizes[size] * 2,
                    transform: [{ scale: innerScale }]
                }}
            />
            <View className="relative z-10">
                <Icon
                    name={isRecording ? "CircleStop" : "Mic"}
                    size={iconSizes[size]}
                    className={isRecording ? "text-error" : "text-text dark:text-text-dark"}
                />
            </View>
        </View>
    )

    const LoadingIndicator = () => (
        <ActivityIndicator
            size={iconSizes[size]}
            className="text-primary dark:text-primary-dark"
        />
    )

    const DebugInfo = () => (
        __DEV__ && (
            <Text style={{
                position: 'absolute',
                bottom: -20,
                textAlign: 'center',
                width: '100%',
                fontSize: 10
            }}>
                {`AudioLevel: ${audioLevel.toFixed(2)} | Scale: ${innerScale.toFixed(2)}`}
            </Text>
        )
    )

    if (asButton) {
        return (
            <>
                <Button
                    onPress={handlePress}
                    variant={isRecording ? "outline" : "outline"}
                    loading={isProcessing}
                >
                    <IconWithPulse />
                </Button>
                {/* <DebugInfo /> */}
            </>
        )
    }



    return (
        <>
            <Pressable
                style={pulseStyle}
                onPress={handlePress}
                className={cn(
                    'items-center justify-center rounded-full',
                    isRecording ? 'bg-error/20' : 'border border-border dark:border-border-dark',
                    buttonSizes[size],
                    className,
                )}
            >
                <View
                    className={cn(
                        'items-center justify-center rounded-full',
                        buttonSizes[size]
                    )}
                >
                    {isProcessing ? <LoadingIndicator /> : <IconWithPulse />}
                </View>
            </Pressable>
            {/* <DebugInfo /> */}
        </>
    )
}