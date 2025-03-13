// src/shared/ui/background/BackgroundWithNoise.tsx
import noiseDark from '@assets/images/bg/noise-dark.png'
import noiseLight from '@assets/images/bg/noise-light.png'
import { useTheme } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Image } from 'react-native'
import { View } from '../view'
const BACKGROUND_VARIANTS = {
    primary: 'bg-background dark:bg-background-dark',
    secondary: 'bg-surface-paper dark:bg-surface-paper-dark',
    accent: 'bg-accent dark:bg-accent-dark',
    surface: 'bg-surface-paper dark:bg-surface-paper-dark',
} as const

type BackgroundWithNoiseProps = {
    children?: React.ReactNode
    noiseOpacity?: number
    variant?: keyof typeof BACKGROUND_VARIANTS
    style?: any
} & (
        | { className: string; backgroundColor?: never }
        | { backgroundColor: string; className?: never }
    )

export const BackgroundWithNoise: React.FC<BackgroundWithNoiseProps> = ({
    children,
    className,
    backgroundColor,
    variant,
    noiseOpacity = 0.3,
    style,
}) => {
    const backgroundStyle = backgroundColor ? { backgroundColor } : undefined
    const variantClassName = variant ? BACKGROUND_VARIANTS[variant] : undefined

    const { isDark } = useTheme()

    const BACKGROUND_URL = isDark ? noiseDark : noiseLight


    return (
        <View
            className={cn('relative', variantClassName, className)}
            style={backgroundStyle}
            {...style}
        >
            <Image
                source={BACKGROUND_URL}
                className="absolute inset-0 h-full w-full"
                style={{ opacity: noiseOpacity }}
                resizeMode="repeat"
            />
            {children}
        </View>
    )
}