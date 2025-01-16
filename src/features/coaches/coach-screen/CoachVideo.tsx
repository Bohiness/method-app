// src/widgets/coach/CoachProfile/CoachVideo/index.tsx
import { useColors } from '@shared/context/theme-provider'
import { Icon } from '@shared/ui/icon'
import { ResizeMode, Video } from 'expo-av'
import React, { useState } from 'react'
import { Image, Pressable, View } from 'react-native'
import WebView from 'react-native-webview'

interface CoachVideoProps {
    /**
     * URL видео (поддерживает YouTube, прямые ссылки на видео)
     */
    url: string
    /**
     * URL превью (если не указан, будет использовано превью YouTube)
     */
    previewUrl?: string
    /**
     * Классы для стилизации
     */
    className?: string
}

export const CoachVideo: React.FC<CoachVideoProps> = ({
    url,
    previewUrl,
    className
}) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const colors = useColors()

    // Определяем, является ли видео YouTube видео
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')

    // Получаем ID видео YouTube если это YouTube видео
    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
        const match = url.match(regExp)
        return match && match[2].length === 11 ? match[2] : null
    }

    // Получаем URL превью для YouTube
    const getPreviewImage = () => {
        if (previewUrl) return previewUrl
        if (isYouTube) {
            const videoId = getYouTubeVideoId(url)
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        }
        return null
    }

    // Рендерим плеер в зависимости от типа видео
    const renderPlayer = () => {
        if (isYouTube) {
            const videoId = getYouTubeVideoId(url)
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`
            return (
                <WebView
                    source={{ uri: embedUrl }}
                    allowsFullscreenVideo
                    style={{ aspectRatio: 16 / 9 }}
                />
            )
        }

        return (
            <Video
                source={{ uri: url }}
                resizeMode={ResizeMode.COVER}
                useNativeControls
                shouldPlay={isPlaying}
                style={{ aspectRatio: 16 / 9 }}
                isLooping={false}
                onFullscreenUpdate={({ fullscreenUpdate }) => {
                    setIsFullscreen(fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT)
                }}
            />
        )
    }

    const previewImage = getPreviewImage()

    return (
        <View className={className}>
            <View className="relative">
                {!isPlaying ? (
                    <>
                        <Image
                            source={{ uri: previewImage }}
                            className="w-full aspect-video rounded-none"
                            resizeMode="cover"
                        />
                        <Pressable
                            onPress={() => setIsPlaying(true)}
                            className="absolute right-4 bottom-4 w-16 h-16 rounded-full bg-pink-500 items-center justify-center"
                        >
                            <Icon
                                name="Play"
                                size={32}
                                color={colors.background}
                            />
                        </Pressable>
                    </>
                ) : (
                    renderPlayer()
                )}
            </View>
        </View>
    )
}