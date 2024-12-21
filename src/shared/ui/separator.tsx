// src/shared/ui/separator/separator.tsx
import { useColorScheme } from '@shared/hooks/systems/colors/useColorScheme'
import React from 'react'
import { View } from 'react-native'

interface SeparatorProps {
    className?: string
}

export const Separator = ({ className = '' }: SeparatorProps) => {
    const colorScheme = useColorScheme()

    return (
        <View
            className={`h-px w-full ${colorScheme === 'dark' ? 'bg-dark-secondary/20' : 'bg-light-secondary/20'} ${className}`}
        />
    )
}
