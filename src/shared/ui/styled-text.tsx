// src/shared/ui/text/StyledText.tsx
import { Colors } from '@shared/constants/colors'
import { useColorScheme } from '@shared/hooks/systems/colors/useColorScheme'
import React from 'react'
import { Text as RNText, TextProps, TextStyle } from 'react-native'

type Variant = 'default' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'tint'
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

interface StyledTextProps extends TextProps {
    variant?: Variant
    size?: Size
    weight?: TextStyle['fontWeight']
    italic?: boolean
    className?: string
}

const getFontSize = (size: Size): number => {
    const sizes = {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        '6xl': 60,
    }
    return sizes[size]
}

const getColor = (variant: Variant, theme: typeof Colors.light) => {
    const colors = {
        default: theme.text,
        secondary: theme.secondaryText,
        accent: theme.accent,
        success: theme.success,
        error: theme.error,
        warning: theme.warning,
        tint: theme.tint,
    }
    return colors[variant]
}

export const Text = ({
    children,
    variant = 'default',
    size = 'base',
    weight = 'normal',
    italic = false,
    className = '',
    style,
    ...props
}: StyledTextProps) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme]

    return (
        <RNText
            className={className}
            style={[
                {
                    color: getColor(variant, theme),
                    fontSize: getFontSize(size),
                    fontWeight: weight,
                    fontStyle: italic ? 'italic' : 'normal',
                },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    )
}

// Готовые компоненты для частых случаев использования
export const Title = (props: StyledTextProps) => (
    <Text size="2xl" weight="bold" {...props} />
)

export const Subtitle = (props: StyledTextProps) => (
    <Text size="lg" variant="secondary" {...props} />
)

export const Caption = (props: StyledTextProps) => (
    <Text size="sm" variant="secondary" {...props} />
)

export const ErrorText = (props: StyledTextProps) => (
    <Text variant="error" size="sm" {...props} />
)

export const SuccessText = (props: StyledTextProps) => (
    <Text variant="success" size="sm" {...props} />
)

export const AccentText = (props: StyledTextProps) => (
    <Text variant="accent" {...props} />
)