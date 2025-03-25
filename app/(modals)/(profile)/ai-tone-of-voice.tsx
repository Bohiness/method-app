"use client"

import { useToneOfVoice } from '@shared/hooks/ai/toneOfVoice.hook'
import { VoiceToneType } from "@shared/types/ai/VoiceTone"
import { GradientCircle } from '@shared/ui/bg/GradientCircle'
import { Button } from '@shared/ui/button'
import { Icon } from "@shared/ui/icon"
import { Text } from "@shared/ui/text"
import { ModalBottomContentView, OutlinedView, View } from '@shared/ui/view'
import { router } from 'expo-router'
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ActivityIndicator, TouchableOpacity, useWindowDimensions } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { Easing, useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated"

export default function AiToneOfVoice() {
    const { t } = useTranslation()
    const dimensions = useWindowDimensions()
    const flatListRef = React.useRef<FlatList>(null)

    // Используем новый хук для работы с тонами голоса
    const {
        loading,
        allTones,
        currentToneIndex,
        changeToneByIndex
    } = useToneOfVoice()

    // Локальное состояние для выбранного тона в интерфейсе
    const [selectedToneIndex, setSelectedToneIndex] = useState(0)

    // Состояние для отслеживания видимых элементов
    const [visibleIndices, setVisibleIndices] = useState<number[]>([])

    // Анимированные значения
    const circleSize = useSharedValue(120)
    const rotationValue = useSharedValue(0)

    // Инициализация данных и анимаций
    useEffect(() => {
        // Синхронизируем локальный индекс с индексом из хука
        setSelectedToneIndex(currentToneIndex)

        // Инициализируем видимые индексы
        setVisibleIndices([currentToneIndex])

        // Прокрутка к выбранному тону
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({
                index: currentToneIndex,
                animated: false
            })
        }, 100)

        // Анимации при загрузке
        circleSize.value = withSpring(120, { damping: 15 })

        // Запуск анимации вращения градиента
        rotationValue.value = withRepeat(
            withTiming(360, { duration: 15000, easing: Easing.linear }),
            -1, // бесконечное повторение
            false
        )
    }, [currentToneIndex])

    // Сохранение выбранного тона
    const saveTone = async () => {
        if (allTones.length && selectedToneIndex >= 0) {
            await changeToneByIndex(selectedToneIndex)
            router.dismiss()
        }
    }

    // Переключение на предыдущий тон
    const prevTone = () => {
        const newIndex = selectedToneIndex === 0 ? allTones.length - 1 : selectedToneIndex - 1
        setSelectedToneIndex(newIndex)
        setVisibleIndices([newIndex])
        flatListRef.current?.scrollToIndex({
            index: newIndex,
            animated: true,
        })
    }

    // Переключение на следующий тон
    const nextTone = () => {
        const newIndex = selectedToneIndex === allTones.length - 1 ? 0 : selectedToneIndex + 1
        setSelectedToneIndex(newIndex)
        setVisibleIndices([newIndex])
        flatListRef.current?.scrollToIndex({
            index: newIndex,
            animated: true,
        })
    }

    // Расчет ширины элемента на основе размера экрана
    const itemWidth = dimensions.width

    // Обработчик перелистывания
    const handleViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            const index = viewableItems[0].index
            setSelectedToneIndex(index)

            // Обновляем список видимых индексов
            const visibleItemIndices = viewableItems.map(item => item.index)
            setVisibleIndices(visibleItemIndices)

            // Небольшая анимация круга при переключении
            circleSize.value = withSpring(115, { damping: 10 })
            setTimeout(() => {
                circleSize.value = withSpring(120, { damping: 8 })
            }, 150)
        }
    }).current

    // Рендер элемента тона голоса
    const renderVoiceTone = ({ item, index }: { item: VoiceToneType, index: number }) => {
        // Проверяем, видим ли текущий элемент, и находится ли он рядом с выбранным (±1)
        const isVisible = visibleIndices.includes(index) ||
            Math.abs(index - selectedToneIndex) <= 1

        return (
            <View className="items-center justify-center gap-y-4" style={{ width: itemWidth }}>
                {/* Анимированный градиентный круг рендерим только если элемент видим */}
                {isVisible ? (
                    <GradientCircle
                        gradient={item.gradient}
                        size={circleSize.value}
                        rotationValue={rotationValue}
                    />
                ) : (
                    // Заглушка того же размера для сохранения верстки
                    <View style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                    }} />
                )}

                <View>
                    {/* Информация о тоне голоса */}
                    <View className="items-center mt-6 gap-y-4">
                        <Text size="2xl" weight="semibold">{item.name}</Text>
                        <Text size="sm" variant='secondary' align='center' className='px-10'>{item.description}</Text>
                    </View>

                    {item.example && (
                        <OutlinedView className='mt-6 mx-6 p-4 rounded-2xl'>
                            <Text size="sm" weight='semibold' variant='secondary' align='left'>{item.name}:</Text>
                            <Text size="sm" variant='secondary' align='left'>{item.example}</Text>
                        </OutlinedView>
                    )}
                </View>
            </View>
        )
    }

    // Отображаем индикатор загрузки, если данные еще не получены
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" variant='default'>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <ModalBottomContentView showHeader title="settings.ai.aiToneOfVoice.title">
            {/* Карусель с тонами голоса */}
            <View className="flex-1 justify-center">
                {/* Кнопка влево */}
                {selectedToneIndex > 0 && (
                    <TouchableOpacity
                        onPress={prevTone}
                        className="absolute left-4 top-1/3 z-10 rounded-full p-2"
                        style={{ transform: [{ translateY: -25 }] }}
                        activeOpacity={0.7}
                    >
                        <Icon name="ChevronLeft" size={20} variant='secondary' />
                    </TouchableOpacity>
                )}

                <FlatList
                    ref={flatListRef}
                    data={allTones}
                    renderItem={renderVoiceTone}
                    keyExtractor={(item) => item.name_id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                    initialScrollIndex={selectedToneIndex}
                    getItemLayout={(data, index) => ({
                        length: itemWidth,
                        offset: itemWidth * index,
                        index,
                    })}
                    // Оптимизация FlatList
                    windowSize={3} // 1 видимый элемент + по 1 в обе стороны
                    maxToRenderPerBatch={3}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                />

                {/* Кнопка вправо */}
                {selectedToneIndex < allTones.length - 1 && (
                    <TouchableOpacity
                        onPress={nextTone}
                        className="absolute right-4 top-1/3 z-10 rounded-full p-2"
                        style={{ transform: [{ translateY: -25 }] }}
                        activeOpacity={0.7}
                    >
                        <Icon name="ChevronRight" size={20} variant='secondary' />
                    </TouchableOpacity>
                )}
            </View>

            {/* Индикаторы (точки) */}
            <View className="flex-row justify-center gap-2 pb-8">
                {allTones.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            setSelectedToneIndex(index)
                            setVisibleIndices([index])
                            flatListRef.current?.scrollToIndex({
                                index,
                                animated: true
                            })
                        }}
                        accessibilityLabel={t("settings.ai.aiToneOfVoice.selectTone", { number: index + 1 })}
                    >
                        <View
                            className={`w-2 h-2 rounded-full ${index === selectedToneIndex
                                ? 'bg-white'
                                : 'bg-gray-600'
                                }`}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Кнопка внизу */}
            <View className="px-6">
                <Button
                    onPress={saveTone}
                    fullWidth
                >
                    {allTones.length > 0 && t("settings.ai.aiToneOfVoice.talkAs", { name: allTones[selectedToneIndex]?.name })}
                </Button>
            </View>
        </ModalBottomContentView>
    )
}