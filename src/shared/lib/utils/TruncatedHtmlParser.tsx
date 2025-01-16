// src/shared/lib/utils/TruncatedHtmlParser.tsx
import { Text } from '@shared/ui/text'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutChangeEvent, View } from 'react-native'
import { HtmlParser } from './html-parser'

interface TruncatedHtmlParserProps {
    html: string
    /**
     * Максимальное количество символов (используется если не указан maxLines)
     * @default 100
     */
    maxLength?: number
    /**
     * Максимальное количество строк
     */
    maxLines?: number
    className?: string
}

export const TruncatedHtmlParser: React.FC<TruncatedHtmlParserProps> = ({
    html,
    maxLength = 100,
    maxLines,
    className
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [shouldTruncate, setShouldTruncate] = React.useState(false)
    const [truncatedHtml, setTruncatedHtml] = React.useState(html)
    const { t } = useTranslation()

    // Для измерения высоты текста
    const [containerHeight, setContainerHeight] = React.useState(0)
    const [lineHeight, setLineHeight] = React.useState(0)

    // Очищаем HTML от тегов для корректного подсчета длины
    const stripHtml = useCallback((html: string) => {
        return html.replace(/<[^>]*>/g, '')
    }, [])

    // Обработчик изменения размера контейнера
    const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
        if (!maxLines) return

        const height = event.nativeEvent.layout.height
        if (containerHeight === 0) {
            setContainerHeight(height)
        }
    }, [maxLines, containerHeight])

    // Обработчик изменения размера текста для определения высоты одной строки
    const handleTextLayout = useCallback((event: LayoutChangeEvent) => {
        if (!maxLines || lineHeight !== 0) return

        const height = event.nativeEvent.layout.height
        const calculatedLineHeight = height / 1 // делим на 1, так как это тестовый текст в одну строку
        setLineHeight(calculatedLineHeight)
    }, [maxLines, lineHeight])

    // Обрезаем текст на основе количества строк или символов
    React.useEffect(() => {
        if (isExpanded) {
            setTruncatedHtml(html)
            return
        }

        if (maxLines && lineHeight > 0 && containerHeight > 0) {
            // Если текст превышает максимальное количество строк
            const maxHeight = lineHeight * maxLines
            if (containerHeight > maxHeight) {
                setShouldTruncate(true)
                // Примерное количество символов на строку (оценка)
                const avgCharsPerLine = 50
                const estimatedLength = maxLines * avgCharsPerLine
                const strippedHtml = stripHtml(html)
                const truncated = html.slice(0, html.indexOf(' ', estimatedLength)) + '...'
                setTruncatedHtml(truncated)
            }
        } else {
            // Обрезка по количеству символов
            const strippedHtml = stripHtml(html)
            const shouldTruncateByLength = strippedHtml.length > maxLength
            setShouldTruncate(shouldTruncateByLength)

            if (shouldTruncateByLength) {
                setTruncatedHtml(html.slice(0, html.indexOf(' ', maxLength)) + '...')
            }
        }
    }, [html, maxLength, maxLines, lineHeight, containerHeight, isExpanded])

    return (
        <View className={className}>
            {/* Тестовый текст для измерения высоты строки */}
            {maxLines && (
                <Text
                    onLayout={handleTextLayout}
                    style={{ opacity: 0, position: 'absolute' }}
                >
                    Test
                </Text>
            )}

            <View onLayout={handleContainerLayout}>
                <HtmlParser
                    html={truncatedHtml}
                    customTagStyles={{
                        p: {
                            marginBottom: 0,
                        }
                    }}
                    removeSpacing={true}
                />
            </View>

            {shouldTruncate && (
                <Text
                    variant="secondary"
                    size="sm"
                    onPress={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? t('common.readLess') : t('common.readMore')}
                </Text>
            )}
        </View>
    )
}