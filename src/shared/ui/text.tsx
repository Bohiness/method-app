import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import React from 'react'
import { Text as RNText, TextProps } from 'react-native'

type Variant = 'default' | 'defaultInverted' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'tint'
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
type Weight = 'normal' | 'medium' | 'semibold' | 'bold'

export interface StyledTextProps extends TextProps {
    variant?: Variant
    size?: Size
    weight?: Weight
    italic?: boolean
    className?: string
    align?: 'left' | 'center' | 'right'
}

const getVariantClasses = (variant: Variant, isDark: boolean): string => {
    const variants = {
        default: isDark ? 'text-text-dark' : 'text-text',
        defaultInverted: isDark ? 'text-text' : 'text-text-dark',
        secondary: isDark ? 'text-secondary-light-dark' : 'text-secondary-light',
        accent: isDark ? 'text-accent-dark' : 'text-accent',
        success: isDark ? 'text-success-dark' : 'text-success',
        error: isDark ? 'text-error-dark' : 'text-error',
        warning: isDark ? 'text-warning-dark' : 'text-warning',
        tint: isDark ? 'text-tint-dark' : 'text-tint'
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

const getAlignClasses = (align: 'left' | 'center' | 'right'): string => {
    const aligns = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }
    return aligns[align]
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
    align = 'left',
    style,
    ...props
}: StyledTextProps) => {
    const { isDark } = useTheme()

    const baseClasses = cn(
        getVariantClasses(variant, isDark),
        getSizeClasses(size),
        getWeightClasses(weight),
        getAlignClasses(align),
        italic && 'italic',
        className,

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
        className={cn(
            'text-text dark:text-text-dark',
            props.className
        )}
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

export const WarningText = (props: StyledTextProps) => (
    <Text
        variant="warning"
        className="text-warning dark:text-warning-dark"
        {...props}
    />
)

export default Text.displayName = 'Text'