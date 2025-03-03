import { useVoiceInput } from '@shared/hooks/voice/useVoiceInput'
import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { Button } from '../button'
import { Icon } from '../icon'

interface VoiceInputButtonProps {
    onTranscribe: (text: string) => void
    size?: 'sm' | 'md' | 'lg'
    className?: string
    asButton?: boolean
    initialText?: string
}

export const VoiceInputButton = ({
    onTranscribe,
    size = 'md',
    className,
    asButton = false,
    initialText = '',
}: VoiceInputButtonProps) => {
    const [accumulatedText, setAccumulatedText] = useState(initialText)
    const [isInitialized, setIsInitialized] = useState(false)

    const {
        isRecording,
        isProcessing,
        audioLevel,
        startRecording,
        stopRecording,
    } = useVoiceInput({
        enabled: true
    })

    // Добавляем эффект для синхронизации с внешним текстом
    useEffect(() => {
        setAccumulatedText(initialText)
    }, [initialText])


    const handlePress = async () => {
        if (!isInitialized) {
            setIsInitialized(true)
            await startRecording()
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            return
        }

        if (isRecording) {
            try {
                const result = await stopRecording()
                if (result?.message) {
                    onTranscribe(result.message)
                }
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            } catch (error) {
                console.error('[VoiceInputButton] Ошибка при остановке записи:', error)
            }
        } else {
            try {
                await startRecording()
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            } catch (error) {
                console.error('[VoiceInputButton] Ошибка при начале новой записи:', error)
            }
        }
    }

    const iconSizes = { sm: 16, md: 18, lg: 20 }
    const buttonSizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-14 h-14' }
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

    const pulseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: innerScale }]
        }
    })

    return (
        <>
            <Pressable
                style={[pulseStyle]}
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
                    {isProcessing ? (
                        <ActivityIndicator
                            className="h-5 w-5"
                        />
                    ) : (
                        <IconWithPulse />
                    )}
                </View>
            </Pressable>
            {/* <DebugInfo /> */}
        </>
    )
}