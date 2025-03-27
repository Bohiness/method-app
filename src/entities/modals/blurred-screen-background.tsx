import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { BlurView } from 'expo-blur'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

type BlurredScreenBackgroundProps = {
    intensity?: number
    children?: React.ReactNode
    overlayOpacity?: number
    className?: string
    rounded?: boolean
    style?: StyleProp<ViewStyle>
    variant?: | 'default'
    | 'paper'    // Для карточек и возвышенных элементов
    | 'canvas'   // Для фоновых элементов
    | 'stone'    // Для выделенных элементов
    | 'transparent' // Прозрачный цвет
    | 'outline' // Для границ
    | 'secondary' // Для вторичных элементов
}

// Компонент для добавления размытия фона в модальных окнах
export const BlurredScreenBackground = ({ intensity = 60, children, overlayOpacity = 0.4, className, rounded = true, variant = 'default', style }: BlurredScreenBackgroundProps) => {
    const { isDark, colors } = useTheme()

    const backgroundColor = () => {
        switch (variant) {
            case 'paper':
                return colors.surface.paper
            case 'stone':
                return colors.surface.stone
            case 'canvas':
                return colors.surface.canvas
            case 'transparent':
                return 'transparent'
            case 'outline':
                return colors.transparent
            case 'secondary':
                return colors.secondary.light
            default:
                return colors.background
        }
    }

    return (
        <View style={[{ flex: 1 }, style]} className={cn(`overflow-hidden ${rounded ? 'rounded-3xl' : ''}`, className)}>
            {/* Полупрозрачный overlay */}
            <View
                style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: backgroundColor(), opacity: overlayOpacity, zIndex: 0 }
                ]}
            />

            {/* Эффект размытия */}
            <BlurView
                intensity={intensity}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Контент */}
            {children && (
                <View style={{ flex: 1, zIndex: 10 }}>
                    {children}
                </View>
            )}
        </View>
    )
}