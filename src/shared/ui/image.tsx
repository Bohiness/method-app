import { cn } from '@shared/lib/utils/cn'
import { Image as ExpoImage, ImageProps as ExpoImageProps, ImageSource } from 'expo-image'
import { useEffect, useState } from 'react'
import { Image as RNImage, StyleProp, View, ViewStyle } from 'react-native'

interface ImageProps extends Omit<ExpoImageProps, 'source' | 'style' | 'priority'> {
    source: ImageSource
    className?: string
    contentFit?: 'cover' | 'contain' | 'fill' | 'none'
    transition?: number
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
    style?: StyleProp<ViewStyle>
    placeholder?: ImageSource
    priority?: boolean
}

export const Image = ({
    source,
    className,
    contentFit = 'cover',
    transition = 200,
    resizeMode = 'cover',
    style,
    placeholder,
    priority = false,
    ...props
}: ImageProps) => {
    const [aspectRatio, setAspectRatio] = useState<number>(1)
    const [isLoading, setIsLoading] = useState(true)
    const [imageLoaded, setImageLoaded] = useState(false)

    const baseClassName = 'overflow-hidden'

    useEffect(() => {
        const getImageSize = async () => {
            try {
                if (typeof source === 'number') {
                    const resolvedSource = RNImage.resolveAssetSource(source)
                    setAspectRatio(resolvedSource.width / resolvedSource.height)
                } else if (typeof source === 'string' || (source && 'uri' in source)) {
                    const uri = typeof source === 'string' ? source : source.uri
                    await new Promise<void>((resolve, reject) => {
                        RNImage.getSize(
                            uri!,
                            (width, height) => {
                                setAspectRatio(width / height)
                                resolve()
                            },
                            reject
                        )
                    })
                }
            } catch (error) {
                console.error('Error getting image size:', error)
            } finally {
                setIsLoading(false)
            }
        }

        getImageSize()
    }, [source])

    // Приоритетные изображения имеют более короткое время перехода
    const actualTransition = priority ? 0 : transition

    return (
        <View className={cn(baseClassName, className)}>
            {(isLoading || !imageLoaded) && placeholder && (
                <ExpoImage
                    source={placeholder}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                    }}
                    contentFit={contentFit}
                />
            )}

            <ExpoImage
                source={source}
                style={{
                    width: '100%',
                    height: '100%',
                    aspectRatio: !isLoading ? aspectRatio : undefined,
                }}
                onLoad={() => setImageLoaded(true)}
                contentFit={contentFit}
                transition={actualTransition}
                cachePolicy={priority ? 'memory-disk' : 'disk'}
                recyclingKey={typeof source === 'string' ? source : (source as any)?.uri}
                {...props}
            />
        </View>
    )
}

// Дополнительные утилиты для работы с изображениями
Image.getImageSize = async (uri: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        RNImage.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            reject
        )
    })
}

Image.resolveAssetSource = (source: number) => {
    return RNImage.resolveAssetSource(source)
}

// Метод для предварительной загрузки изображений
Image.prefetch = async (uri: string): Promise<boolean> => {
    try {
        await ExpoImage.prefetch(uri)
        return true
    } catch (error) {
        console.error('Error prefetching image:', error)
        return false
    }
}