import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import React from 'react'
import { Text as RNText, TextProps } from 'react-native'

type Variant = 'default' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'tint'
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
type Weight = 'normal' | 'medium' | 'semibold' | 'bold'

interface StyledTextProps extends TextProps {
    variant?: Variant
    size?: Size
    weight?: Weight
    italic?: boolean
    className?: string
}

const getVariantClasses = (variant: Variant, colorScheme: 'light' | 'dark'): string => {
    const variants = {
        default: colorScheme === 'dark' ? 'text-text-dark' : 'text-text',
        secondary: colorScheme === 'dark' ? 'text-secondary-light-dark' : 'text-secondary-light',
        accent: colorScheme === 'dark' ? 'text-accent-dark' : 'text-accent',
        success: colorScheme === 'dark' ? 'text-success-dark' : 'text-success',
        error: colorScheme === 'dark' ? 'text-error-dark' : 'text-error',
        warning: colorScheme === 'dark' ? 'text-warning-dark' : 'text-warning',
        tint: colorScheme === 'dark' ? 'text-tint-dark' : 'text-tint'
    }
    return variants[variant]
}

const getSizeClasses = (size: Size): string => {
    const sizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl'
    }
    return sizes[size]
}

const getWeightClasses = (weight: Weight): string => {
    const weights = {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold'
    }
    return weights[weight]
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
    const { colorScheme } = useTheme()

    const baseClasses = cn(
        getVariantClasses(variant, colorScheme),
        getSizeClasses(size),
        getWeightClasses(weight),
        italic && 'italic',
        className
    )

    return (
        <RNText
            className={baseClasses}
            style={style}
            {...props}
        >
            {children}
        </RNText>
    )
}

// Готовые компоненты для частых случаев использования
export const Title = (props: StyledTextProps) => (
    <Text
        size="2xl"
        weight="medium"
        className="text-text dark:text-text-dark"
        {...props}
    />
)

export const Subtitle = (props: StyledTextProps) => (
    <Text
        size="lg"
        variant="secondary"
        className="text-secondary-light dark:text-secondary-light-dark"
        {...props}
    />
)

export const Caption = (props: StyledTextProps) => (
    <Text
        size="sm"
        variant="secondary"
        className="text-secondary-light dark:text-secondary-light-dark"
        {...props}
    />
)

export const ErrorText = (props: StyledTextProps) => (
    <Text
        variant="error"
        size="sm"
        className="text-error dark:text-error-dark"
        {...props}
    />
)

export const SuccessText = (props: StyledTextProps) => (
    <Text
        variant="success"
        size="sm"
        className="text-success dark:text-success-dark"
        {...props}
    />
)

export const AccentText = (props: StyledTextProps) => (
    <Text
        variant="accent"
        className="text-accent dark:text-accent-dark"
        {...props}
    />
)