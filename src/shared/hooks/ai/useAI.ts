/**
 * @fileoverview Хук для работы с AI функционалом, включая текстовый чат и голосовой ввод
 */

import { chatApiService } from '@shared/api/ai/ai-api.service';
import { AiMessageType } from '@shared/types/ai/AiTypes';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Опции для конфигурации хука useAI
 * @interface UseAIOptions
 * @property {('chat'|'single')} [mode='single'] - Режим работы: 'chat' для чата с историей, 'single' для одиночных ответов
 */
interface UseAIOptions {
    mode?: 'chat' | 'single';
    url?: string;
}

/**
 * Хук для взаимодействия с AI функционалом
 * @param {UseAIOptions} options - Опции конфигурации
 * @returns {Object} Объект с методами и состояниями для работы с AI
 * @property {AiMessageType[]} messages - История сообщений (для режима chat)
 * @property {string} currentResponse - Текущий ответ AI (для режима single)
 * @property {Function} sendMessage - Функция для отправки текстового сообщения
 * @property {Function} sendVoice - Функция для отправки голосового сообщения
 * @property {boolean} isSending - Флаг отправки текстового сообщения
 * @property {boolean} isVoiceLoading - Флаг обработки голосового сообщения
 */
export const useAI = ({ mode = 'single', url }: UseAIOptions = {}) => {
    const [messages, setMessages] = useState<AiMessageType[]>([]);
    const [currentResponse, setCurrentResponse] = useState<string>('');

    /**
     * Мутация для отправки текстовых сообщений
     * @param {Object} params - Параметры сообщения
     * @param {string} params.message - Текст сообщения
     * @param {string} [params.model='gpt-4o-mini'] - Модель AI для обработки
     */
    const { mutate: sendMessage, isPending: isSending } = useMutation({
        mutationFn: async ({ message, model = 'gpt-4o-mini' }: { message: string; model?: string }) => {
            if (mode === 'chat') {
                setMessages(prev => [
                    ...prev,
                    { content: message, is_user: true, created_at: new Date().toISOString() },
                ]);
            }

            const response = await chatApiService.sendMessage(message, model);
            const reader = response.getReader();
            let accumulatedMessage = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                accumulatedMessage += chunk;

                if (mode === 'chat') {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];

                        if (!lastMessage?.is_user) {
                            newMessages[newMessages.length - 1] = {
                                ...lastMessage,
                                content: accumulatedMessage,
                            };
                        } else {
                            newMessages.push({
                                content: accumulatedMessage,
                                is_user: false,
                                created_at: new Date().toISOString(),
                            });
                        }
                        return newMessages;
                    });
                } else {
                    setCurrentResponse(accumulatedMessage);
                }
            }
        },
    });

    /**
     * Мутация для отправки голосовых сообщений
     * @param {File} audioFile - Аудио файл для транскрипции
     */
    const { mutateAsync: sendVoice, isPending: isVoiceLoading } = useMutation({
        mutationFn: async (audioFile: File) => {
            const response = await chatApiService.sendVoice(audioFile, url);
            return response;
        },
    });

    return {
        messages,
        currentResponse,
        sendMessage,
        sendVoice,
        isSending: isSending || isVoiceLoading,
        isVoiceLoading,
    };
};
