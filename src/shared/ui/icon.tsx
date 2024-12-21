import { icons } from 'lucide-react-native'
import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export type IconName = keyof typeof icons

interface IconProps {
    name: IconName
    size?: number
    color?: string
    style?: StyleProp<ViewStyle>
    strokeWidth?: number
}

export function Icon({
    name,
    size = 24,
    color = '#000',
    style,
    strokeWidth = 2
}: IconProps) {
    const LucideIcon = icons[name]

    return (
        <LucideIcon
            size={size}
            color={color}
            className={`w-${size} h-${size} ${color}`}
            style={style}
            strokeWidth={strokeWidth}
        />
    )
}