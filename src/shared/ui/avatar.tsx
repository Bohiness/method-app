// src/shared/ui/avatar/avatar.tsx
import { useColors } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Text } from '@shared/ui/text'
import React, { useMemo } from 'react'
import { Image, ImageProps, ImageSourcePropType, View } from 'react-native'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type AvatarShape = 'circle' | 'square'
interface AvatarGroupProps {
    avatars: Omit<AvatarProps, 'size'>[]
    size?: AvatarSize
    shape?: AvatarShape // Добавляем проп формы
    max?: number
    className?: string
}

interface AvatarProps extends Omit<ImageProps, 'source'> {
    /**
     * URL изображения или react-native image source
     */
    source?: string | ImageSourcePropType
    /**
     * Размер аватара
     * @default 'md'
     */
    size?: AvatarSize
    /**
     * Форма аватара
     * @default 'circle'
     */
    shape?: AvatarShape
    /**
     * Fallback текст, отображается если изображение не загрузилось
     * Обычно это первая буква имени пользователя
     */
    fallback?: string
    /**
     * Статус пользователя (онлайн/офлайн)
     * @default false
     */
    isOnline?: boolean
    /**
     * Дополнительные стили для контейнера
     */
    className?: string
}

// Уточняем типы для размеров
const sizeMap: Record<AvatarSize, {
    container: string,
    text: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
}> = {
    'xs': { container: 'w-8 h-8', text: 'xs' },
    'sm': { container: 'w-10 h-10', text: 'sm' },
    'md': { container: 'w-12 h-12', text: 'base' },
    'lg': { container: 'w-16 h-16', text: 'lg' },
    'xl': { container: 'w-20 h-20', text: 'xl' },
    '2xl': { container: 'w-24 h-24', text: '2xl' },
}

const statusSizeMap: Record<AvatarSize, string> = {
    'xs': 'w-2 h-2',
    'sm': 'w-2.5 h-2.5',
    'md': 'w-3 h-3',
    'lg': 'w-4 h-4',
    'xl': 'w-5 h-5',
    '2xl': 'w-6 h-6',
}

const shapeMap: Record<AvatarShape, string> = {
    circle: 'rounded-full',
    square: 'rounded-2xl'
}

const AvatarComponent = ({
    source,
    size = 'md',
    shape = 'circle',
    fallback,
    isOnline = false,
    className,
    ...props
}: AvatarProps) => {
    const colors = useColors()
    const [error, setError] = React.useState(false)

    // Мемоизируем преобразование URL в ImageSourcePropType
    const imageSource = useMemo(() => {
        return typeof source === 'string' ? { uri: source } : source
    }, [source])

    // Мемоизируем стили для производительности
    const styleProps = useMemo(() => {
        const { container: containerSize, text: textSize } = sizeMap[size]
        const statusSize = statusSizeMap[size]
        const borderRadius = shapeMap[shape]

        return {
            containerSize,
            textSize,
            statusSize,
            borderRadius
        }
    }, [size, shape])

    // Мемоизируем рендер контента
    const renderContent = useMemo(() => {
        if (!error && imageSource) {
            return (
                <Image
                    source={imageSource}
                    className={cn("w-full h-full", styleProps.borderRadius)}
                    onError={(e) => {
                        console.warn('Avatar image loading error:', e.nativeEvent.error)
                        setError(true)
                    }}
                    {...props}
                />
            )
        }

        if (fallback) {
            return (
                <View className={cn("w-full h-full bg-surface-paper dark:bg-surface-paper-dark items-center justify-center", styleProps.borderRadius)}>
                    <Text
                        size={styleProps.textSize}
                        className="text-text dark:text-text-dark"
                    >
                        {fallback.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )
        }

        return (
            <View className={cn("w-full h-full bg-surface-paper dark:bg-surface-paper-dark items-center justify-center", styleProps.borderRadius)}>
                <Text
                    size={styleProps.textSize}
                    className="text-text dark:text-text-dark"
                >
                    ?
                </Text>
            </View>
        )
    }, [error, imageSource, fallback, styleProps, props])

    return (
        <View className={cn("relative", className)}>
            <View
                className={cn(
                    styleProps.containerSize,
                    styleProps.borderRadius,
                    "overflow-hidden",
                    !imageSource && !error && "bg-surface-paper dark:bg-surface-paper-dark"
                )}
            >
                {renderContent}
            </View>

            {isOnline && (
                <View
                    className={cn(
                        styleProps.statusSize,
                        "absolute bottom-0 right-0 rounded-full border-2 border-background dark:border-background-dark",
                    )}
                    style={{ backgroundColor: colors.success }}
                />
            )}
        </View>
    )
}

// Оборачиваем компонент в React.memo для предотвращения ненужных перерисовок
export const Avatar = React.memo(AvatarComponent)

// AvatarGroup компонент теперь тоже поддерживает shape и обернут в React.memo
const AvatarGroupComponent = ({
    avatars,
    size = 'md',
    shape = 'circle',
    max = 3,
    className
}: AvatarGroupProps & { shape?: AvatarShape }) => {
    // Мемоизация обработанных данных для AvatarGroup
    const { displayAvatars, remainingCount } = useMemo(() => {
        return {
            displayAvatars: avatars.slice(0, max),
            remainingCount: avatars.length - max
        }
    }, [avatars, max])

    // Мемоизация вычисления отступа
    const marginOffset = useMemo(() => {
        return -(sizeMap[size].container.split('w-')[1]) / 3
    }, [size])

    return (
        <View className={cn("flex-row", className)}>
            {displayAvatars.map((avatar, index) => (
                <View
                    key={index}
                    style={{ marginLeft: index > 0 ? marginOffset : 0 }}
                >
                    <Avatar
                        size={size}
                        shape={shape}
                        {...avatar}
                    />
                </View>
            ))}

            {remainingCount > 0 && (
                <View
                    className={cn(
                        sizeMap[size].container,
                        shapeMap[shape],
                        "bg-surface-paper dark:bg-surface-paper-dark items-center justify-center",
                    )}
                    style={{ marginLeft: marginOffset }}
                >
                    <Text
                        size={sizeMap[size].text}
                        className="text-text dark:text-text-dark"
                    >
                        +{remainingCount}
                    </Text>
                </View>
            )}
        </View>
    )
}

export const AvatarGroup = React.memo(AvatarGroupComponent)