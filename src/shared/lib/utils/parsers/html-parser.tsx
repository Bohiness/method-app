// src/shared/ui/text/html-parser.tsx
import { useTheme } from '@shared/context/theme-provider'
import React, { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import RenderHtml, {
    MixedStyleDeclaration,
    defaultSystemFonts
} from 'react-native-render-html'

interface HtmlParserProps {
    html: string
    className?: string
    customTagStyles?: Partial<Record<keyof typeof defaultTagsStyles, MixedStyleDeclaration>>
    removeSpacing?: boolean
}

export const HtmlParser: React.FC<HtmlParserProps> = ({
    html,
    className,
    customTagStyles,
    removeSpacing = false
}) => {
    const { width } = useWindowDimensions()
    const { colors } = useTheme()

    // Функция очистки HTML от пустых строк и лишних пробелов
    const cleanHtml = useMemo(() => {
        if (!html) return ''

        return html
            // Удаляем пустые параграфы
            .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
            // Удаляем множественные переносы строк
            .replace(/(\r\n|\n|\r){2,}/gm, '\n')
            // Удаляем пустые div
            .replace(/<div[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, '')
            // Удаляем пустые span
            .replace(/<span[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/span>/gi, '')
            // Удаляем множественные пробелы
            .replace(/\s{2,}/g, ' ')
            // Удаляем пробелы перед и после тегов
            .replace(/>\s+</g, '><')
            .trim()
    }, [html])

    // Базовые стили для всех тегов, используя Tailwind-подобные значения
    // Базовые стили с отступами
    const spacingStyles = {
        body: {
            marginVertical: 8,
        },
        p: {
            marginBottom: 16,
        },
        h1: {
            marginVertical: 24,
        },
        h2: {
            marginVertical: 20,
        },
        h3: {
            marginVertical: 16,
        },
        h4: {
            marginVertical: 16,
        },
        h5: {
            marginVertical: 12,
        },
        h6: {
            marginVertical: 12,
        },
        ul: {
            marginVertical: 16,
            paddingLeft: 16,
        },
        ol: {
            marginVertical: 16,
            paddingLeft: 16,
        },
        li: {
            marginBottom: 4,
        },
        blockquote: {
            marginVertical: 16,
            paddingLeft: 16,
        },
        pre: {
            marginVertical: 16,
            padding: 16,
        }
    }

    // Базовые стили для всех тегов
    const baseTagsStyles = {
        body: {
            color: colors.text,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'System',
        },
        p: {
            color: colors.text,
            fontSize: 14,
            lineHeight: 20,
        },
        span: {
            color: colors.text,
        },
        b: {
            fontWeight: "700",
        },
        strong: {
            fontWeight: "600",
        },
        h1: {
            fontSize: 24,
            lineHeight: 32,
            fontWeight: "700",
            color: colors.text,
        },
        h2: {
            fontSize: 20,
            lineHeight: 28,
            fontWeight: "700",
            color: colors.text,
        },
        h3: {
            fontSize: 18,
            lineHeight: 24,
            fontWeight: "600",
            color: colors.text,
        },
        h4: {
            fontSize: 16,
            lineHeight: 24,
            fontWeight: "600",
            color: colors.text,
        },
        h5: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "500",
            color: colors.text,
        },
        h6: {
            fontSize: 12,
            lineHeight: 16,
            fontWeight: "500",
            color: colors.text,
        },
        ul: {
            color: colors.text,
        },
        ol: {
            color: colors.text,
        },
        li: {
            fontSize: 14,
            lineHeight: 20,
            color: colors.text,
        },
        a: {
            color: colors.text,
            textDecorationLine: 'underline',
        },
        blockquote: {
            borderLeftWidth: 4,
            borderLeftColor: colors.border,
            fontStyle: 'italic',
            color: colors.text,
        },
        code: {
            fontFamily: 'System',
            backgroundColor: colors.surface?.paper || '#f1f5f9',
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: 12,
            color: colors.text,
        },
        pre: {
            backgroundColor: colors.surface?.paper || '#f1f5f9',
            borderRadius: 8,
            color: colors.text,
        }
    } as const

    // Объединяем стили в зависимости от параметра removeSpacing
    const defaultTagsStyles = Object.fromEntries(
        Object.entries(baseTagsStyles).map(([tag, styles]) => [
            tag,
            {
                ...styles,
                ...(removeSpacing ? {} : spacingStyles[tag as keyof typeof spacingStyles]),
            }
        ])
    ) as typeof baseTagsStyles

    const tagsStyles = {
        ...defaultTagsStyles,
        ...customTagStyles,
    }

    return (
        <RenderHtml
            contentWidth={width}
            source={{ html: cleanHtml }}
            tagsStyles={tagsStyles}
            systemFonts={[...defaultSystemFonts, 'System']}
            defaultTextProps={{
                allowFontScaling: false,
            }}
            enableExperimentalMarginCollapsing
            classesStyles={{
                [className ?? '']: {},
            }}
        />
    )
}