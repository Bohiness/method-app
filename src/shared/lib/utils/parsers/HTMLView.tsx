import { View } from '@shared/ui/view'
import React from 'react'
import { MixedStyleDeclaration } from 'react-native-render-html'
import { HtmlParser } from './html-parser'

export interface ConvertHTMLtoViewProps {
    /**
     * HTML-контент для отображения
     */
    html: string
    /**
     * Дополнительные CSS-классы для контейнера
     */
    className?: string
    /**
     * Пользовательские стили для HTML-тегов
     */
    customTagStyles?: Record<string, MixedStyleDeclaration>
    /**
     * Удалить отступы между элементами
     */
    removeSpacing?: boolean
    /**
     * Вариант контейнера
     */
    variant?: 'default' | 'paper' | 'canvas' | 'stone' | 'inverse' | 'transparent'
}

/**
 * Компонент для преобразования HTML-контента в нативные компоненты React Native
 */
export const HTMLView: React.FC<ConvertHTMLtoViewProps> = ({
    html,
    className,
    customTagStyles,
    removeSpacing = false,
    variant = 'transparent'
}) => {
    // Если HTML-контент пустой, возвращаем null
    if (!html || html.trim() === '') {
        return null
    }

    return (
        <View variant={variant} className={className}>
            <HtmlParser
                html={html}
                customTagStyles={customTagStyles}
                removeSpacing={removeSpacing}
            />
        </View>
    )
}

/**
 * Функция для чистки HTML-кода от ненужных тегов и атрибутов
 * @param html - HTML-строка для очистки
 * @returns Очищенная HTML-строка
 */
export function sanitizeHtml(html: string): string {
    if (!html) return ''

    return html
        // Удаляем скрипты
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Удаляем стили
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Удаляем комментарии
        .replace(/<!--[\s\S]*?-->/g, '')
        // Удаляем пустые параграфы
        .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
        // Удаляем пустые дивы
        .replace(/<div[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, '')
        // Заменяем множественные пробелы на один
        .replace(/\s{2,}/g, ' ')
        // Удаляем пробелы перед и после тегов
        .replace(/>\s+</g, '><')
        .trim()
}

export default HTMLView
