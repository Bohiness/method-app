import { apiClient } from '@shared/config/api-client'
import { useTheme } from '@shared/context/theme-provider'
import { useVoiceInput } from '@shared/hooks/voice/useVoiceInput'
import { AIResponse } from '@shared/ui/ai/AIResponse'
import { GlowingEdge } from '@shared/ui/ai/GlowingEdge'
import { WaveEffect } from '@shared/ui/ai/WaveEffect'
import { Text } from '@shared/ui/text'
import * as Haptics from 'expo-haptics'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'

export type AIState = 'idle' | 'listening' | 'processing' | 'responding' | 'error'

interface AIContextType {
    state: AIState
    isVisible: boolean
    response: string | null
    startListening: () => Promise<void>
    stopListening: () => Promise<void>
    showAI: () => void
    hideAI: () => void
    audioLevel: number
    error: string | null
    toggleVisibility: () => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

interface AIProviderProps {
    children: React.ReactNode
}


export const AIProvider: React.FC<AIProviderProps> = ({
    children
}) => {
    const [state, setState] = useState<AIState>('idle')
    const [isVisible, setIsVisible] = useState(false)
    const [response, setResponse] = useState<string | null>(null)
    const { colors } = useTheme()

    const handleTranscription = useCallback(async (text: string) => {
        // Внутренняя обработка транскрипции
        console.log('Transcribed text:', text)

        setState('processing')
        try {
            // Отправляем запрос к AI API
            const response = await apiClient.post<{ answer: string }>('/api/ai/process', {
                text,
                language: 'ru' // Можно получать из контекста языка
            })

            setState('responding')
            setResponse(response.answer)

            // Автоматически скрываем ответ через 5 секунд
            setTimeout(() => {
                setState('idle')
                setIsVisible(false)
                setResponse(null)
            }, 5000)
        } catch (error) {
            console.error('AI processing error:', error)
            setState('error')
            setResponse('Не удалось обработать запрос')

            // Скрываем сообщение об ошибке через 3 секунды
            setTimeout(() => {
                setState('idle')
                setIsVisible(false)
                setResponse(null)
            }, 3000)
        }
    }, [])

    useEffect(() => {
        console.log('WaveEffect: isVisible =', isVisible)
        console.log('WaveEffect: audioLevel =', audioLevel)
    }, [isVisible])

    const {
        isRecording,
        isProcessing,
        error,
        audioLevel,
        startRecording,
        stopRecording
    } = useVoiceInput({
        onTranscribe: handleTranscription
    })

    const showAI = useCallback(() => {
        setIsVisible(true)
        setState('idle')
    }, [])

    const hideAI = useCallback(() => {
        setIsVisible(false)
        setState('idle')
        setResponse(null)
    }, [])

    const handleStartListening = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setState('listening')
        showAI()
        await startRecording()
    }

    const handleStopListening = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await stopRecording()
    }

    const toggleVisibility = () => {
        setIsVisible(prev => !prev)
    }

    const value = {
        state,
        isVisible,
        response,
        startListening: handleStartListening,
        stopListening: handleStopListening,
        showAI,
        hideAI,
        toggleVisibility,
        audioLevel,
        error
    }

    return (
        <AIContext.Provider value={value}>
            <Pressable onPress={toggleVisibility} className="flex-1">
                <View className="flex-1">
                    {children}

                    {isVisible && (
                        <View
                            className="absolute inset-0 items-center justify-center z-50"
                            style={{
                                backgroundColor: `${colors.background}99`,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                            }}
                        >
                            <View style={{ position: 'relative', width: '100%', height: '100%' }}>
                                {/* Светящиеся края */}
                                <GlowingEdge
                                    position="left"
                                    audioLevel={audioLevel}
                                    color={colors.tint}
                                    isVisible={isVisible}
                                />
                                <GlowingEdge
                                    position="right"
                                    audioLevel={audioLevel}
                                    color={colors.success}
                                    isVisible={isVisible}
                                />
                                <GlowingEdge
                                    position="top"
                                    audioLevel={audioLevel}
                                    color={colors.warning}
                                    isVisible={isVisible}
                                />
                                <GlowingEdge
                                    position="bottom"
                                    audioLevel={audioLevel}
                                    color={colors.error}
                                    isVisible={isVisible}
                                />


                                <WaveEffect
                                    audioLevel={audioLevel}
                                    isVisible={isVisible && (state === 'listening' || state === 'processing')}
                                />

                                {/* Ответ AI */}
                                {response && state === 'responding' && (
                                    <AIResponse text={response} />
                                )}

                                {/* Сообщение об ошибке */}
                                {error && state === 'error' && (
                                    <Text className="mt-4 text-error text-center px-4">
                                        {error}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </Pressable>
        </AIContext.Provider>
    )
}

export const useAI = () => {
    const context = useContext(AIContext)
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider')
    }
    return context
}