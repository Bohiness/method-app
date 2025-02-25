// src/shared/types/chat/ChatTypes.ts

export interface AiMessageType {
    content: string;
    is_user: boolean;
    created_at: string;
}

export interface AiConversationType {
    id: number;
    created_at: string;
    messages: AiMessageType[];
}

export interface AiChatResponseType {
    message: string;
}
