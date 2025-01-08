// src/shared/ui/separator/separator.tsx
import { useTheme } from '@shared/context/theme-provider'
import React from 'react'
import { View } from 'react-native'

interface SeparatorProps {
    className?: string
}

export const Separator = ({ className = '' }: SeparatorProps) => {
    const { isDark } = useTheme()

    return (
        <View
            className={`h-px w-full ${isDark ? 'bg-surface-paper-dark' : 'bg-surface-paper'} ${className}`}
        />
    )
}
