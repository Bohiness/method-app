import { useTheme } from '@shared/context/theme-provider'
import { StyledTextProps, Text } from '@shared/ui/text'
import React from 'react'
import { View, ViewProps } from 'react-native'


export interface AlertProps extends ViewProps {
    variant?: 'default' | 'destructive' | 'warning' | 'success'
    className?: string
    children?: React.ReactNode
}

export const Alert = React.forwardRef<View, AlertProps>(
    ({ variant = 'default', className = '', children, style, ...props }, ref) => {
        const { isDark } = useTheme()

        const getBackgroundColor = () => {
            switch (variant) {
                case 'destructive':
                    return isDark ? 'bg-error/20' : 'bg-error/10'
                case 'warning':
                    return isDark ? 'bg-warning/10' : 'bg-warning/10'
                case 'success':
                    return isDark ? 'bg-success/10' : 'bg-success/10'
                default:
                    return isDark ? 'bg-dark-surface-paper/80' : 'bg-light-surface-paper/80'
            }
        }

        const getBorderColor = () => {
            switch (variant) {
                case 'destructive':
                    return isDark ? 'border-error/40' : 'border-error/30'
                case 'warning':
                    return isDark ? 'border-warning/30' : 'border-warning/30'
                case 'success':
                    return isDark ? 'border-success/30' : 'border-success/30'
                default:
                    return isDark ? 'border-dark-border' : 'border-light-border'
            }
        }

        return (
            <View
                ref={ref}
                className={`p-4 rounded-lg border ${getBackgroundColor()} ${getBorderColor()} ${className}`}
                style={style}
                {...props}
            >
                {children}
            </View>
        )
    }
)

export const AlertTitle = ({ className = '', ...props }: StyledTextProps) => {
    return <Text size="lg" weight="bold" className={`mb-1 ${className}`} {...props} />
}

export const AlertDescription = ({ className = '', ...props }: StyledTextProps) => {
    return <Text variant="secondary" size="sm" className={className} {...props} />
}
