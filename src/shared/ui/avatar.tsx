// src/shared/ui/avatar/avatar.tsx
import { useColors } from '@shared/context/theme-provider'
import { cn } from '@shared/lib/utils/cn'
import { Image } from '@shared/ui/image'
import { Text } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React, { useEffect, useMemo, useState } from 'react'
import { ImageProps as RNImageProps, StyleSheet } from 'react-native'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type AvatarShape = 'circle' | 'square'
interface AvatarGroupProps {
    avatars: Omit<AvatarProps, 'size'>[]
    size?: AvatarSize
    shape?: AvatarShape // Добавляем проп формы
    max?: number
    className?: string
}

// Модифицируем тип для исключения проблемного свойства
type ImageProps = Omit<RNImageProps, 'resizeMode'>

interface AvatarProps extends Omit<ImageProps, 'source'> {
    /**
     * URL изображения или react-native image source
     */
    source?: string
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
    /**
     * Приоритет загрузки изображения
     * @default false
     */
    priority?: boolean
    /**
     * Политика кеширования изображения
     * @default 'memory-disk'
     */
    cachePolicy?: 'none' | 'memory' | 'disk' | 'memory-disk'
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

// Тип для события загрузки изображения
interface ImageLoadEvent {
    source?: { uri?: string, width?: number, height?: number }
    width?: number
    height?: number
    cacheType?: string
}

// Глобальный кеш для URL изображений
const imageCache = new Map<string, boolean>()


// Создаем дополнительные стили
const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
        flex: 1,
        minWidth: 8, // Минимальные размеры для гарантии отображения
        minHeight: 8,
    },
    fullSize: {
        width: '100%',
        height: '100%',
        flex: 1,
    },
    container: {
        position: 'relative',
        overflow: 'hidden',
    }
})

const AvatarComponent = ({
    source,
    size = 'md',
    shape = 'circle',
    fallback,
    isOnline = false,
    className,
    priority = false,
    cachePolicy = 'memory-disk',
    ...props
}: AvatarProps) => {
    const colors = useColors()
    // Используем независимые состояния для лучшего контроля и отладки
    const [error, setError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [renderCount, setRenderCount] = useState(0)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    const sourceKey = typeof source === 'string' ? source : source ? JSON.stringify(source) : ''

    // Получаем физические размеры для этого размера аватара
    const getPhysicalSize = (size: AvatarSize): number => {
        const sizeMap: Record<AvatarSize, number> = {
            'xs': 32,
            'sm': 40,
            'md': 48,
            'lg': 64,
            'xl': 80,
            '2xl': 96,
        }
        return sizeMap[size]
    }

    // Мемоизируем преобразование URL в ImageSourcePropType
    const imageSource = useMemo(() => {
        if (!source) return undefined
        const source_ = typeof source === 'string' ? { uri: source } : source
        return source_
    }, [source])

    // Логируем рендер и инициализируем из кеша если изображение есть
    useEffect(() => {
        setRenderCount(prev => prev + 1)

        // Инициализация из кеша
        if (sourceKey && imageCache.has(sourceKey)) {
            setIsLoaded(true)
            setIsVisible(true)
        } else if (!sourceKey) {
            // Нет source
            setError(true)
        } else {
            // Сбрасываем состояния при новом source
            setIsLoaded(false)
            setIsVisible(false)
            setError(false)
        }
    }, [sourceKey])

    // Предварительная загрузка аватаров
    useEffect(() => {
        if (typeof source === 'string' && source) {

            if (!imageCache.has(sourceKey)) {
                Image.prefetch(source)
                    .then(() => {
                        imageCache.set(sourceKey, true)
                        setIsLoaded(true)
                        setIsVisible(true)
                    })
                    .catch(error => {
                        console.error(error)
                        setError(true)
                    })
            }
        }
    }, [source, sourceKey])

    // Мемоизируем стили для производительности
    const styleProps = useMemo(() => {
        const { container: containerSize, text: textSize } = sizeMap[size]
        const statusSize = statusSizeMap[size]
        const borderRadius = shapeMap[shape]
        const physicalSize = getPhysicalSize(size)

        return {
            containerSize,
            textSize,
            statusSize,
            borderRadius,
            physicalSize
        }
    }, [size, shape])

    // Рендер fallback контента
    const fallbackContent = (
        <View className={cn("w-full h-full bg-surface-paper dark:bg-surface-paper-dark items-center justify-center", styleProps.borderRadius)}>
            <Text
                size={styleProps.textSize}
                className="text-text dark:text-text-dark"
            >
                {fallback ? fallback.charAt(0).toUpperCase() : '?'}
            </Text>
        </View>
    )

    // Индикатор загрузки
    const loadingContent = (
        <View className={cn("w-full h-full items-center justify-center", styleProps.borderRadius, "bg-surface-stone dark:bg-surface-stone-dark")}>
            <Text
                size="xs"
                className="text-text dark:text-text-dark opacity-50"
            >
                ...
            </Text>
        </View>
    )

    // Конвертируем размер в конкретные пиксели для стилей
    const sizeStyle = {
        width: styleProps.physicalSize,
        height: styleProps.physicalSize,
    }

    // Определяем, что показывать на экране
    let content: React.ReactNode
    if (error || !imageSource) {
        content = fallbackContent
    } else if (!isLoaded) {
        content = loadingContent
    } else {
        content = (
            <>
                {/* Основное изображение */}
                <Image
                    source={imageSource}
                    style={[styles.image, sizeStyle]}
                    className={styleProps.borderRadius}
                    onError={(event) => {
                        const errorMsg = (event as any).error || 'Unknown error'
                        console.warn('Avatar image loading error:', errorMsg)
                        setError(true)
                    }}
                    onLoad={(event: ImageLoadEvent) => {
                        // Сохраняем размеры, даже если они нулевые
                        const width = event?.width || styleProps.physicalSize
                        const height = event?.height || styleProps.physicalSize

                        // setDimensions({ width, height })

                        setDimensions({ width, height })
                        setIsLoaded(true)
                        setIsVisible(true)

                        if (sourceKey) {
                            imageCache.set(sourceKey, true)
                        }
                    }}
                    onContentLoaded={() => {
                        setIsVisible(true)
                    }}
                    priority={priority}
                    placeholder={fallback ? { uri: '' } : undefined}
                    contentFit="cover"
                    transition={0} // Отключаем переход для более быстрого отображения
                    cachePolicy={cachePolicy}
                    {...(props as any)}
                />

                {/* Невидимый fallback для гарантии отображения чего-то */}
                {!isVisible && loadingContent}
            </>
        )
    }

    // Определяем физические размеры контейнера
    const containerClasses = cn(
        styleProps.containerSize,
        styleProps.borderRadius,
        "overflow-hidden",
        className
    )

    return (
        <View className="relative">
            <View
                className={containerClasses}
                style={sizeStyle}
            >
                {content}
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

// Экспортируем без React.memo для лучшей отладки
export const Avatar = AvatarComponent

// AvatarGroup компонент
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