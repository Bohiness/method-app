// src/shared/lib/utils/html-parser.tsx
import { useTheme } from '@shared/context/theme-provider'
import React from 'react'
import { useWindowDimensions } from 'react-native'
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html'

interface HtmlParserProps {
    html: string
    className?: string
}

export const HtmlParser: React.FC<HtmlParserProps> = ({
    html,
    className
}) => {
    const { width } = useWindowDimensions()
    const { colors } = useTheme()

    const tagsStyles = {
        body: {
            color: colors.text,
            fontSize: 14,
            lineHeight: 20,
        },
        p: {
            marginBottom: 8,
            color: colors.text,
        },
        b: {
            fontWeight: "700",
        },
        strong: {
            fontWeight: "500",
        }
    }

    return (
        <RenderHtml
            contentWidth={width}
            source={{ html }}
            tagsStyles={tagsStyles}
            systemFonts={[...defaultSystemFonts, 'System']}
            defaultTextProps={{
                allowFontScaling: false,
            }}
            enableExperimentalMarginCollapsing
        />
    )
}