import { Factor } from '../mood/MoodType';

import { Emotion } from '../mood/MoodType';

// Полный тип Journal, который получаем с сервера
export interface Journal {
    // Основные поля
    id: number | null; // null для локальных записей
    user: number | null; // null для локальных записей
    created_at: string;
    content: string;

    // Эмоции
    emotions: number[]; // ID связанных эмоций
    emotions_data: Emotion[]; // Полные данные связанных эмоций
    primary_emotion: number | null; // ID основной эмоции
    primary_emotion_data: Emotion | null; // Полные данные основной эмоции
    emotion: string | null; // Устаревшее текстовое поле

    // Анализ тональности
    sentiment: number | null;

    // Категории
    categories: number[]; // ID связанных категорий
    categories_data: Factor[]; // Полные данные связанных категорий
    primary_category: number | null; // ID основной категории
    primary_category_data: Factor | null; // Полные данные основной категории
    category: string | null; // Устаревшее текстовое поле

    // Анализ текста
    main_topic: string | null;
    keywords: string[] | null;
    question_count: number;
    length: number;

    // Результаты анализа
    insights: string[] | null;
    triggers: string[] | null;
    awareness_level: string | null;
}

// Тип для создания новой записи
export interface JournalCreate {
    content: string;
}

// Тип для обновления существующей записи
export interface JournalUpdate {
    content: string;
}

// Расширяем тип Journal для локального хранения
export interface LocalJournal extends Journal {
    local_id: number;
    is_deleted?: boolean;
    is_synced?: boolean;
    is_template?: boolean;
}

export interface PsyProfile {
    id: number;
    user: number;
    last_updated: string;

    // Основные характеристики профиля
    top_category: string | null;
    awareness_level: string | null;
    avg_emotion: string | null;
    reflection_count: number;
    thinking_style: string | null;

    // Когнитивные характеристики
    cognitive_distortions: Record<string, number> | null; // {"чёрно-белое мышление": 5, "катастрофизация": 2}
    self_reflection_level: number | null;
    common_triggers: string[] | null; // ["конфликты", "неуверенность", "работа"]

    // Дополнительные характеристики
    preferred_journaling_time: string | null; // "Утро", "Вечер", "Весь день"
    self_confidence_score: number | null; // Оценка уверенности (0-1)
    negative_thinking_tendency: number | null; // Склонность к негативному мышлению (0-1)
    action_vs_thought_ratio: number | null; // Соотношение "делаю vs. размышляю"
}

export interface JournalStatistics {
    // Базовая статистика
    total_entries: number; // Общее количество записей
    avg_length: number; // Средняя длина записей
    journal_days: number; // Количество дней ведения журнала

    // Статистика по категориям и эмоциям (старый формат)
    emotions: Record<string, number>; // {"Радость": 5, "Грусть": 3}
    categories: Record<string, number>; // {"Работа": 4, "Семья": 2}

    // Статистика по эмоциям и категориям (новый формат)
    primary_emotions: Record<string, number>; // {"Радость": 5, "Грусть": 3}
    primary_categories: Record<string, number>; // {"Работа": 4, "Семья": 2}

    // Возможное поле для ошибок
    error?: string;
}
