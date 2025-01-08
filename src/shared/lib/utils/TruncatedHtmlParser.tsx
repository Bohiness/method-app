// src/shared/lib/utils/TruncatedHtmlParser.tsx
import { Button } from '@shared/ui/button'
import { Text } from '@shared/ui/text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { HtmlParser } from './html-parser'

interface TruncatedHtmlParserProps {
    html: string
    maxLength?: number
    className?: string
}

export const TruncatedHtmlParser: React.FC<TruncatedHtmlParserProps> = ({
    html,
    maxLength = 150,
    className
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const { t } = useTranslation()

    // Очищаем HTML от тегов для корректного подсчета длины
    const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>/g, '')
    }

    const strippedHtml = stripHtml(html)
    const shouldTruncate = strippedHtml.length > maxLength
    const truncatedHtml = isExpanded ? html : (
        shouldTruncate ?
            html.slice(0, html.indexOf(' ', maxLength)) + '...' :
            html
    )

    return (
        <View className={className}>
            <HtmlParser html={truncatedHtml} />

            {shouldTruncate && (
                <Button
                    variant="ghost"
                    onPress={() => setIsExpanded(!isExpanded)}
                    className="mt-2"
                >
                    <Text
                        variant="secondary"
                        size="sm"
                    >
                        {isExpanded ? t('readLess') : t('readMore')}
                    </Text>
                </Button>
            )}
        </View>
    )
}
