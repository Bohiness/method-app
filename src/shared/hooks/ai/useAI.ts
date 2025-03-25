/**
 * @fileoverview Хук для работы с AI функционалом, включая текстовый чат и голосовой ввод
 */

import { chatApiService } from '@shared/api/ai/ai-api.service';
import { logger } from '@shared/lib/logger/logger.service';
import { AiMessageType } from '@shared/types/ai/AiTypes';
import { settingsOfAiType } from '@shared/types/ai/VoiceTone';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Опции для конфигурации хука useAI
 * @interface UseAIOptions
 * @property {('chat'|'single')} [mode='single'] - Режим работы: 'chat' для чата с историей, 'single' для одиночных ответов
 * @property {string} [url] - URL для отправки запросов
 * @property {boolean} [autoStream=true] - Автоматический стриминг ответов
 */
interface UseAIOptions {
    mode?: 'chat' | 'single';
    url?: string;
    autoStream?: boolean;
}

/**
 * Опции для отправки сообщения
 */
interface SendMessageOptions {
    message: string;
    model?: string;
    stream?: boolean;
    settingsOfAi?: settingsOfAiType;
    onStream?: (partialResponse: string) => void;
}

/**
 * Опции для отправки голосового сообщения
 */
interface SendVoiceOptions {
    audioFile:
        | File
        | {
              uri: string;
              type: string;
              name: string;
          };
    stream?: boolean;
    model?: string;
    onStream?: (partialResponse: string) => void;
}

/**
 * Получение текстового содержимого из различных форматов ответа API
 */
const extractTextFromResponse = (response: unknown): string => {
    if (typeof response === 'string') {
        return response;
    }

    if (response && typeof response === 'object') {
        // Проверяем формат {message: "текст"}
        if ('message' in response && typeof response.message === 'string') {
            return response.message;
        }

        // Другие возможные форматы ответа
        if ('content' in response && typeof response.content === 'string') {
            return response.content;
        }

        if ('text' in response && typeof response.text === 'string') {
            return response.text;
        }
    }

    // Если не удалось извлечь текст, возвращаем пустую строку
    return '';
};

/**
 * Функция для предобработки текста перед отправкой в AI
 * Добавляет маркеры для блоков текста на основе их источника (AI или пользователь)
 */
const preprocessTextForAI = (html: string): string => {
    // Создаем временный DOM-элемент для работы с HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Находим все блоки с атрибутами data-source
    const aiBlocks = doc.querySelectorAll('[data-source="ai"]');

    // Перебираем блоки и добавляем префиксы/суффиксы
    aiBlocks.forEach(block => {
        const model = block.getAttribute('data-model') || 'gpt';
        const tone = block.getAttribute('data-tone') || 'neutral';

        // Добавляем специальные маркеры в начало и конец блока AI
        const marker = document.createElement('span');
        marker.style.display = 'none';
        marker.textContent = `[AI-${model.toUpperCase()}-${tone}]`;

        const endMarker = document.createElement('span');
        endMarker.style.display = 'none';
        endMarker.textContent = '[/AI]';

        // Вставляем маркеры
        block.insertBefore(marker, block.firstChild);
        block.appendChild(endMarker);
    });

    return doc.body.innerHTML;
};

/**
 * Хук для взаимодействия с AI функционалом
 * @param {UseAIOptions} options - Опции конфигурации
 * @returns {Object} Объект с методами и состояниями для работы с AI
 * @property {AiMessageType[]} messages - История сообщений (для режима chat)
 * @property {string} currentResponse - Текущий ответ AI (для режима single)
 * @property {Function} sendMessage - Функция для отправки текстового сообщения
 * @property {Function} sendVoice - Функция для отправки голосового сообщения
 * @property {boolean} isSending - Флаг отправки сообщения
 * @property {boolean} isVoiceLoading - Флаг обработки голосового сообщения
 * @property {Function} cancelRequest - Функция для отмены текущего запроса
 * @property {Function} clearMessages - Функция для очистки истории сообщений
 * @property {Function} removeLastMessage - Функция для удаления последнего сообщения
 * @property {Function} streamResponse - Функция для отправки сообщения с возможностью стриминга ответа через колбэк
 */
export const useAI = ({ mode = 'single', url, autoStream = true }: UseAIOptions = {}) => {
    const [messages, setMessages] = useState<AiMessageType[]>([]);
    const [currentResponse, setCurrentResponse] = useState<string>('');
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const onStreamCallbackRef = useRef<((partialResponse: string) => void) | null>(null);

    useEffect(() => {
        logger.log(currentResponse, 'useEffect -- useAI', 'currentResponse');

        // Вызываем колбэк для обработки стрима, если он установлен
        if (onStreamCallbackRef.current && currentResponse) {
            onStreamCallbackRef.current(currentResponse);
        }
    }, [currentResponse]);

    useEffect(() => {
        logger.log(messages, 'useEffect -- useAI', 'messages');
    }, [messages]);

    /**
     * Отмена текущего запроса
     */
    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Сбрасываем колбэк стрима при отмене запроса
        onStreamCallbackRef.current = null;
    }, []);

    /**
     * Очистка истории сообщений
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
        setCurrentResponse('');
    }, []);

    /**
     * Удаление последнего сообщения
     */
    const removeLastMessage = useCallback(() => {
        setMessages(prev => prev.slice(0, -1));
    }, []);

    /**
     * Обработка стриминга ответа
     */
    const handleResponseStream = useCallback(
        async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
            let accumulatedMessage = '';

            try {
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
                        // Обновляем текущий ответ при каждом новом чанке для более плавного стриминга
                        logger.log(chunk, 'useAI - handleResponseStream', 'streaming chunk received');
                        setCurrentResponse(accumulatedMessage);
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Ошибка при чтении стрима:', error);
                }
            }

            return accumulatedMessage;
        },
        [mode]
    );

    /**
     * Мутация для отправки текстовых сообщений
     */
    const { mutate: sendMessageMutation, isPending: isSendingMessage } = useMutation({
        mutationFn: async ({
            message,
            model = 'gpt-4o-mini',
            stream = autoStream,
            settingsOfAi,
            onStream,
        }: SendMessageOptions) => {
            if (mode === 'chat') {
                setMessages(prev => [
                    ...prev,
                    { content: message, is_user: true, created_at: new Date().toISOString() },
                ]);
            }

            // Отмена предыдущего запроса
            cancelRequest();

            // Сохраняем колбэк для стриминга, если он предоставлен
            if (onStream) {
                onStreamCallbackRef.current = onStream;
            } else {
                onStreamCallbackRef.current = null;
            }

            // Создание нового контроллера отмены
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            try {
                const response = await chatApiService.sendMessage({
                    message,
                    model,
                    responseType: stream ? 'stream' : 'text',
                    settingsOfAi,
                    signal,
                });

                if (stream && response instanceof Response && response.body) {
                    const reader = response.body.getReader();
                    return await handleResponseStream(reader);
                } else {
                    const text = extractTextFromResponse(response);

                    if (mode === 'chat') {
                        setMessages(prev => [
                            ...prev,
                            { content: text, is_user: false, created_at: new Date().toISOString() },
                        ]);
                    } else {
                        setCurrentResponse(text);
                    }

                    return text;
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Ошибка при отправке сообщения:', error);
                    throw error;
                }
                return '';
            } finally {
                abortControllerRef.current = null;
            }
        },
        retry: 0,
    });

    /**
     * Мутация для отправки голосовых сообщений
     */
    const { mutateAsync: sendVoiceMutation, isPending: isSendingVoice } = useMutation({
        mutationFn: async ({ audioFile, stream = autoStream, model = 'gpt-4o-mini', onStream }: SendVoiceOptions) => {
            setIsProcessingVoice(true);

            try {
                // Отмена предыдущего запроса
                cancelRequest();

                // Сохраняем колбэк для стриминга, если он предоставлен
                if (onStream) {
                    onStreamCallbackRef.current = onStream;
                } else {
                    onStreamCallbackRef.current = null;
                }

                // Создание нового контроллера отмены
                abortControllerRef.current = new AbortController();
                const signal = abortControllerRef.current.signal;

                // @ts-ignore - TS не видит дополнительные параметры в типе, но API поддерживает их
                const response = await chatApiService.sendVoice(audioFile, url, {
                    signal,
                    stream,
                    model,
                });

                logger.log(response, 'useAI – sendVoiceMutation', 'response from sendVoiceMutation');
                logger.log(stream, 'useAI – sendVoiceMutation', 'stream or not');

                if (stream && response instanceof Response && response.body) {
                    const reader = response.body.getReader();
                    logger.log('reader', 'useAI – sendVoiceMutation');
                    return await handleResponseStream(reader);
                } else {
                    // Извлекаем текст из различных форматов ответа
                    const text = extractTextFromResponse(response);

                    if (mode === 'chat') {
                        setMessages(prev => [
                            ...prev,
                            { content: text, is_user: false, created_at: new Date().toISOString() },
                        ]);
                    } else {
                        setCurrentResponse(text);
                    }
                    logger.log(text, 'useAI – sendVoiceMutation', 'extracted text from response');
                    return text;
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    logger.error(error, 'useAI – sendVoiceMutation', 'Ошибка при обработке голосового сообщения:');
                    throw error;
                }
                return '';
            } finally {
                setIsProcessingVoice(false);
                abortControllerRef.current = null;
            }
        },
        retry: 0,
    });

    /**
     * Обертка для отправки текстового сообщения
     */
    const sendMessage = useCallback(
        (options: string | SendMessageOptions) => {
            const messageOptions = typeof options === 'string' ? { message: options } : options;
            return sendMessageMutation(messageOptions);
        },
        [sendMessageMutation]
    );

    /**
     * Обертка для отправки голосового сообщения
     */
    const sendVoice = useCallback(
        (options: File | { uri: string; type: string; name: string } | SendVoiceOptions) => {
            // Проверяем тип входных данных
            let voiceOptions: SendVoiceOptions;

            if (options instanceof File) {
                // Веб File объект
                voiceOptions = { audioFile: options };
            } else if ('audioFile' in options) {
                // Уже правильный формат SendVoiceOptions
                voiceOptions = options;
            } else if ('uri' in options) {
                // React Native формат с uri
                voiceOptions = { audioFile: options };
            } else {
                // Неизвестный формат
                console.error('Неподдерживаемый формат файла:', options);
                throw new Error('Неподдерживаемый формат аудиофайла');
            }

            return sendVoiceMutation(voiceOptions);
        },
        [sendVoiceMutation]
    );

    /**
     * Функция для стриминга ответа с колбэком
     * @param {string} prompt - Текст запроса
     * @param {Object} options - Дополнительные опции (модель, тон голоса и т. д.)
     * @param {Function} onStream - Колбэк для обработки промежуточных ответов стрима
     * @returns {Promise<string>} Финальный ответ после завершения стрима
     */
    const streamResponse = useCallback(
        async ({
            text,
            options,
            settingsOfAi,
            onStream,
        }: {
            text: string;
            options?: { model?: string };
            settingsOfAi?: settingsOfAiType;
            onStream?: (partialResponse: string) => void;
        }): Promise<string> => {
            // Сбрасываем текущий ответ перед началом нового запроса
            setCurrentResponse('');

            // Предобрабатываем текст перед отправкой, добавляя маркеры для блоков
            let processedText = text;
            try {
                if (typeof window !== 'undefined' && window.DOMParser) {
                    processedText = preprocessTextForAI(text);
                }
            } catch (error) {
                logger.error(error, 'streamResponse', 'Error preprocessing text');
                // В случае ошибки используем исходный текст
                processedText = text;
            }

            // Создаем Promise для ожидания завершения ответа
            return new Promise((resolve, reject) => {
                try {
                    let finalResponse = '';
                    let wasResponseReceived = false;
                    let noChangeCounter = 0;
                    let lastLength = 0;

                    // Создаем локальный колбэк для обработки промежуточных ответов и проверки завершения
                    const handleStreamUpdate = (response: string) => {
                        // Вызываем пользовательский колбэк, если он предоставлен
                        if (onStream) {
                            onStream(response);
                        }

                        wasResponseReceived = true;
                        finalResponse = response;
                    };

                    // Отправляем сообщение с нашим колбэком для обработки стрима
                    sendMessage({
                        message: processedText,
                        stream: true,
                        model: options?.model,
                        settingsOfAi: {
                            toneOfVoice: settingsOfAi?.toneOfVoice,
                            typeOfDeeper: settingsOfAi?.typeOfDeeper,
                        },
                        onStream: handleStreamUpdate,
                    });

                    // Создаем интервал для проверки завершения ответа
                    const checkInterval = setInterval(() => {
                        if (wasResponseReceived) {
                            // Если длина ответа не меняется в течение нескольких проверок, считаем что стрим завершен
                            if (finalResponse.length === lastLength) {
                                noChangeCounter++;
                                if (noChangeCounter >= 10) {
                                    // ~1 секунда без изменений
                                    clearInterval(checkInterval);
                                    resolve(finalResponse);
                                }
                            } else {
                                // Сбрасываем счетчик, если ответ изменился
                                noChangeCounter = 0;
                                lastLength = finalResponse.length;
                            }
                        }
                    }, 100);

                    // Таймаут на случай, если ответ не будет получен или не будет завершен
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        if (wasResponseReceived) {
                            resolve(finalResponse); // Возвращаем то, что успели получить
                        } else {
                            reject(new Error('Тайм-аут ожидания ответа от AI'));
                        }
                    }, 30000); // 30 секунд максимального ожидания
                } catch (error) {
                    reject(error);
                }
            });
        },
        [sendMessage]
    );

    return {
        messages,
        currentResponse,
        sendMessage,
        sendVoice,
        isSending: isSendingMessage || isSendingVoice || isProcessingVoice,
        isVoiceLoading: isSendingVoice || isProcessingVoice,
        cancelRequest,
        clearMessages,
        removeLastMessage,
        streamResponse,
    };
};
