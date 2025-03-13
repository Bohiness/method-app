// src/shared/ui/skeleton/skeleton.tsx
import { useColors } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import React from 'react'
import { View, ViewProps } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'custom'
type SkeletonSize = 'sm' | 'md' | 'lg'

interface SkeletonProps extends ViewProps {
    /**
     * Вариант отображения скелетона
     * @default 'rectangular'
     */
    variant?: SkeletonVariant
    /**
     * Предустановленный размер
     * @default 'md'
     */
    size?: SkeletonSize
    /**
     * Высота для кастомного размера
     */
    height?: number | 'auto' | `${number}%`
    /**
     * Ширина для кастомного размера
     */
    width?: number | 'auto' | `${number}%`
    /**
     * Включить/выключить анимацию
     * @default true
     */
    animate?: boolean
    /**
     * Дополнительные классы
     */
    className?: string
    /**
     * Множественные скелетоны
     */
    count?: number
    /**
     * Отступ между множественными скелетонами
     * @default 8
     */
    spacing?: number
}

const AnimatedView = Animated.createAnimatedComponent(View)

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'rectangular',
    size = 'md',
    height,
    width,
    animate = true,
    className,
    count = 1,
    spacing = 8,
    style,
    ...props
}) => {
    const colors = useColors()

    // Размеры по умолчанию для разных вариантов
    const defaultSizes = {
        text: {
            sm: { height: 16, width: '100%' },
            md: { height: 20, width: '100%' },
            lg: { height: 24, width: '100%' },
        },
        circular: {
            sm: { height: 24, width: 24, borderRadius: 12 },
            md: { height: 40, width: 40, borderRadius: 20 },
            lg: { height: 56, width: 56, borderRadius: 28 },
        },
        rectangular: {
            sm: { height: 40, width: '100%' },
            md: { height: 60, width: '100%' },
            lg: { height: 80, width: '100%' },
        },
    }

    // Получаем размеры в зависимости от варианта и размера
    const getSize = () => {
        if (height || width) {
            return {
                height: height || 'auto',
                width: width || 'auto',
            }
        }

        if (variant === 'custom') {
            return {
                height: 'auto',
                width: 'auto',
            }
        }

        return defaultSizes[variant][size]
    }

    // Анимация мерцания
    const animatedStyle = useAnimatedStyle(() => {
        if (!animate) return { opacity: 0.5 }

        return {
            opacity: withRepeat(
                withSequence(
                    withTiming(0.3, { duration: 800 }),
                    withTiming(0.7, { duration: 800 }),
                ),
                -1,
                true,
            ),
        }
    })

    // Базовые классы для разных вариантов
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        custom: '',
    }

    // Создаем массив для множественных скелетонов
    const skeletons = Array.from({ length: count }, (_, index) => (
        <AnimatedView
            key={index}
            style={[
                {
                    backgroundColor: colors.surface.stone,
                    marginTop: index > 0 ? spacing : 0,
                },
                getSize(),
                animatedStyle,
                style,
            ]}
            className={cn(variantClasses[variant], className)}
            {...props}
        />
    ))

    return <>{skeletons}</>
}

// Пресеты для частых случаев использования
export const TextSkeleton = (props: Omit<SkeletonProps, 'variant'>) => (
    <Skeleton variant="text" {...props} />
)

export const AvatarSkeleton = (props: Omit<SkeletonProps, 'variant'>) => (
    <Skeleton variant="circular" {...props} />
)

export const CardSkeleton = (props: Omit<SkeletonProps, 'variant'>) => (
    <Skeleton variant="rectangular" {...props} />
)

// Составные скелетоны
export const ListItemSkeleton = ({
    className,
    ...props
}: Omit<SkeletonProps, 'variant'>) => (
    <View className={cn('flex-row items-center space-x-4', className)}>
        <AvatarSkeleton size="md" />
        <View className="flex-1 space-y-2">
            <TextSkeleton width="60%" />
            <TextSkeleton width="40%" />
        </View>
    </View>
)

export const CardWithContentSkeleton = ({
    className,
    ...props
}: Omit<SkeletonProps, 'variant'>) => (
    <View className={cn('space-y-4', className)}>
        <CardSkeleton height={200} />
        <View className="space-y-2">
            <TextSkeleton width="80%" />
            <TextSkeleton count={3} />
        </View>
    </View>
)