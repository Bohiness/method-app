import { cn } from '@shared/lib/utils/cn'
import { Image as ExpoImage, ImageSource } from 'expo-image'
import React, { useEffect, useState } from 'react'
import { Image as RNImage, StyleProp, View, ViewStyle } from 'react-native'


interface ImageProps {
    source: ImageSource | number
    className?: string
    contentFit?: 'cover' | 'contain' | 'fill' | 'none'
    transition?: number
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
    style?: StyleProp<ViewStyle>

}

export const Image = ({
    source,
    className,
    contentFit = 'cover',
    transition = 200,
    resizeMode = 'cover',
    style,
    ...props
}: ImageProps) => {
    const [aspectRatio, setAspectRatio] = useState<number>(1)
    const [isLoading, setIsLoading] = useState(true)

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

    if (isLoading) {
        return <View className={className} />
    }

    return (
        <View className={cn(baseClassName, className)}>
            <ExpoImage
                source={source}
                style={{
                    width: '100%',
                    height: '100%',
                    aspectRatio
                }}
                contentFit={contentFit}
                transition={transition}
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