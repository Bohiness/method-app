import { useVoiceInput } from '@shared/hooks/voice/useVoiceInput'
import { cn } from '@shared/lib/utils/cn'
import * as Haptics from 'expo-haptics'
import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useAnimatedStyle } from 'react-native-reanimated'
import { Button } from '../button'
import { Icon } from '../icon'

interface VoiceInputButtonProps {
    onTranscribe: (text: string) => void
    size?: 'sm' | 'md' | 'lg'
    className?: string
    asButton?: boolean
}

export const VoiceInputButton = ({
    onTranscribe,
    size = 'md',
    className,
    asButton = false,
}: VoiceInputButtonProps) => {
    const [accumulatedText, setAccumulatedText] = useState('')

    // Обработчик транскрибации внутри компонента
    const handleTranscribe = (newText: string, shouldAppend = true) => {
        const updatedText = shouldAppend
            ? (accumulatedText ? `${accumulatedText} ${newText}` : newText)
            : newText

        setAccumulatedText(updatedText)
        onTranscribe(updatedText)
    }

    const {
        isRecording,
        isProcessing,
        audioLevel,
        startRecording,
        stopRecording,
    } = useVoiceInput({ onTranscribe: handleTranscribe })


    const handlePress = async () => {
        if (isRecording) {
            await stopRecording()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } else {
            await startRecording()
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
    }

    const iconSizes = { sm: 16, md: 20, lg: 24 }
    const buttonSizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' }
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
                <DebugInfo />
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
                    isRecording ? 'bg-error/20' : 'bg-error dark:bg-error-dark',
                    buttonSizes[size],
                    className
                )}
            >
                <View
                    className={cn(
                        'items-center justify-center rounded-full',
                        buttonSizes[size]
                    )}
                >
                    <IconWithPulse />
                </View>
            </Pressable>
            <DebugInfo />
        </>
    )
}