/**
 * @fileoverview Сервис для взаимодействия с AI API, обеспечивающий функционал текстового и голосового общения
 */

import { apiClient } from '@shared/config/api-client';
import { API_ROUTES } from '@shared/constants/api-routes';
import { AiChatResponseType } from '@shared/types/ai/AiTypes';

/**
 * Класс для работы с AI API
 * @class ChatApiService
 */
class ChatApiService {
    /**
     * Отправляет текстовое сообщение в AI и получает потоковый ответ
     * @async
     * @param {string} message - Текст сообщения для обработки
     * @param {string} [model='gpt-4o-mini'] - Модель AI для обработки сообщения
     * @returns {Promise<ReadableStream>} Поток данных с ответом от AI
     * @throws {Error} Ошибка при неудачной отправке сообщения
     */
    async sendMessage(message: string, model: string = 'gpt-4o-mini'): Promise<ReadableStream> {
        return await apiClient.post(
            API_ROUTES.AI.CHAT,
            { message, model },
            {
                responseType: 'stream',
            }
        );
    }

    /**
     * Отправляет голосовое сообщение для транскрипции
     * @async
     * @param {File} audioFile - Аудио файл для обработки
     * @returns {Promise<AiChatResponseType>} Объект с транскрибированным текстом
     * @throws {Error} Ошибка при неудачной загрузке или обработке аудио
     */
    async sendVoice(audioFile: File, url?: string): Promise<AiChatResponseType> {
        const formData = new FormData();
        formData.append('audio', audioFile);

        return await apiClient.post(url ?? API_ROUTES.AI.VOICE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
}

/**
 * Экспортируемый экземпляр сервиса для работы с AI API
 * @const chatApiService
 */
export const chatApiService = new ChatApiService();
