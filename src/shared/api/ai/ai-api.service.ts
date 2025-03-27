/**
 * @fileoverview Сервис для взаимодействия с AI API, обеспечивающий функционал текстового и голосового общения
 */

import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/system/api-routes';
import { AiChatResponseType } from '@shared/types/ai/AiTypes';
import { DeeperType } from '@shared/types/ai/VoiceTone';

/**
 * Класс для работы с AI API
 * @class ChatApiService
 */
class ChatApiService {
    /**
     * Отправляет текстовое сообщение в AI и получает потоковый ответ
     * @async
     * @param {object} params - Параметры запроса
     * @param {string} params.message - Текст сообщения для обработки
     * @param {string} [params.model='gpt-4o-mini'] - Модель AI для обработки сообщения
     * @param {'stream' | 'text'} [params.responseType='stream'] - Тип ожидаемого ответа
     * @param {AbortSignal} [params.signal] - Сигнал для отмены запроса
     * @param {object} [params.settingsOfAi] - Настройки AI (тон голоса и т.д.)
     * @param {number} [params.timeout=240000] - Таймаут запроса в миллисекундах (по умолчанию 4 минуты)
     * @returns {Promise< ReadableStream | AiChatResponseType >} Поток данных или объект с ответом от AI
     * @throws {Error} Ошибка при неудачной отправке сообщения
     */
    async sendMessage({
        message,
        model = 'gpt-4o-mini',
        responseType = 'stream',
        signal,
        settingsOfAi,
        timeout = 240000,
    }: {
        message: string;
        model?: string;
        responseType?: 'stream' | 'text';
        signal?: AbortSignal;
        settingsOfAi?: {
            toneOfVoice?: string;
            typeOfDeeper?: DeeperType;
        };
        timeout?: number;
    }): Promise<ReadableStream | AiChatResponseType> {
        const config = {
            signal,
            timeout,
        };

        return await apiClient.post(API_ROUTES.AI.CHAT, { message, model, responseType, settingsOfAi }, config);
    }

    /**
     * Отправляет голосовое сообщение для транскрипции
     * @async
     * @param {File} audioFile - Аудио файл для обработки
     * @param {string} [url] - Альтернативный URL эндпоинта
     * @param {number} [timeout=180000] - Таймаут для запроса транскрипции (по умолчанию 3 минуты)
     * @returns {Promise<AiChatResponseType>} Объект с транскрибированным текстом
     * @throws {Error} Ошибка при неудачной загрузке или обработке аудио
     */
    async sendVoice(audioFile: File, url?: string, timeout: number = 180000): Promise<AiChatResponseType> {
        const formData = new FormData();
        formData.append('audio', audioFile);

        return await apiClient.post(url ?? API_ROUTES.AI.VOICE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout,
        });
    }
}

/**
 * Экспортируемый экземпляр сервиса для работы с AI API
 * @const chatApiService
 */
export const chatApiService = new ChatApiService();
