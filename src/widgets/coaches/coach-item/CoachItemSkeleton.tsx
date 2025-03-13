// src/widgets/coaches/CoachItemSkeleton.tsx
import { Skeleton } from '@shared/ui/skeleton'
import { Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface CoachItemSkeletonProps {
    /**
     * Дополнительные классы для внешнего контейнера
     */
    className?: string
}

export const CoachItemSkeleton: React.FC<CoachItemSkeletonProps> = ({
    className
}) => {
    return (
        <View className={`rounded-lg py-4 ${className || ''}`}>
            {/* Верхняя часть с фото и основной информацией */}
            <View className="flex-row">
                {/* Аватар */}
                <View className="w-1/4 mr-3">
                    <View className="aspect-square overflow-hidden rounded-lg">
                        <Skeleton
                            variant="rectangular"
                            className="w-full h-full rounded-lg"
                        />
                    </View>
                </View>

                {/* Основная информация справа от аватара */}
                <View className="flex-1">
                    {/* Имя и верификация */}
                    <View className="flex-row items-center mb-1">
                        <Skeleton
                            variant="text"
                            width="60%"
                            height={24}
                            className="mr-2"
                        />
                        <Skeleton
                            variant="circular"
                            size="sm"
                        />
                    </View>

                    {/* Цена */}
                    <View className="mt-2">
                        <Skeleton
                            variant="text"
                            width="30%"
                            className="mb-1"
                        />
                        <Skeleton
                            variant="text"
                            width="20%"
                            size="sm"
                        />
                    </View>
                </View>

                {/* Кнопка лайка */}
                <Skeleton
                    variant="circular"
                    size="md"
                />
            </View>

            {/* Нижняя часть с тегами и описанием */}
            <View className="mt-4">
                {/* Первая группа тегов */}
                <View className="mb-4">
                    <Skeleton
                        variant="text"
                        width="20%"
                        size="sm"
                        className="mb-2"
                    />
                    <View className="flex-row">
                        <Skeleton
                            variant="rectangular"
                            width="25%"
                            height={24}
                            className="rounded-full mr-2"
                        />
                        <Skeleton
                            variant="rectangular"
                            width="30%"
                            height={24}
                            className="rounded-full"
                        />
                    </View>
                </View>

                {/* Вторая группа тегов */}
                <View className="mb-4">
                    <Skeleton
                        variant="text"
                        width="20%"
                        size="sm"
                        className="mb-2"
                    />
                    <View className="flex-row">
                        <Skeleton
                            variant="rectangular"
                            width="28%"
                            height={24}
                            className="rounded-full mr-2"
                        />
                        <Skeleton
                            variant="rectangular"
                            width="32%"
                            height={24}
                            className="rounded-full"
                        />
                    </View>
                </View>

                {/* Описание */}
                <View>
                    <Skeleton
                        variant="text"
                        count={3}
                        className="mt-1"
                    />
                </View>
            </View>
        </View>
    )
}

// Компонент для отображения списка скелетонов
export const CoachListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    const { t } = useTranslation()
    return (
        <>
            <Title>{t('coaches.list.mini.title')}</Title>

            {Array.from({ length: count }).map((_, index) => (
                <CoachItemSkeleton
                    key={index}
                    className={index !== count - 1 ? 'mb-4' : ''}
                />
            ))}
        </>
    )
}