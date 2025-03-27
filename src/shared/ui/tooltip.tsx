import { cn } from '@shared/lib/utils/cn'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions, // Используем RNView для обертки триггера
    type LayoutRectangle,
    Modal,
    Platform,
    Pressable,
    type PressableProps,
    StatusBar,
    View,
} from 'react-native'

import { Text } from './text'
import { View as StyledView, type ViewVariant, getVariantClasses } from './view'

// Определяем возможные размеры тултипа
type TooltipSize = 'sm' | 'md' | 'lg'

// Определяем типы для layout
interface Point { x: number; y: number }
interface TriggerLayout extends LayoutRectangle, Point { } // Добавляем x, y относительно окна

interface TooltipProps extends PressableProps {
    textKey: string
    children: React.ReactNode
    placement?: 'top' | 'bottom' | 'left' | 'right'
    variant?: ViewVariant
    size?: TooltipSize
    className?: string
    offset?: number
    on?: 'press' | 'longpress'
    /** Задержка перед показом при долгом нажатии (в мс) */
    longPressDelayMs?: number
}

// Функция для получения классов размера (остается без изменений)
const getSizeClasses = (size: TooltipSize) => {
    switch (size) {
        case 'sm': return { container: 'px-1.5 py-0.5', text: 'xs' as const }
        case 'lg': return { container: 'px-3 py-1.5', text: 'base' as const }
        case 'md': default: return { container: 'px-2 py-1', text: 'sm' as const }
    }
}

// Функция для вычисления позиции тултипа (улучшенная версия)
const calculateTooltipPosition = (
    triggerLayout: TriggerLayout,
    tooltipLayout: LayoutRectangle,
    placement: NonNullable<TooltipProps['placement']>,
    offset: number
): { top: number; left: number } => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
    // Учитываем статус-бар только на Android
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0
    const safeAreaPadding = 5 // Отступ от краев экрана

    let top = 0
    let left = 0

    const triggerCenterY = triggerLayout.y + triggerLayout.height / 2
    const triggerCenterX = triggerLayout.x + triggerLayout.width / 2

    // 1. Рассчитываем идеальную позицию
    switch (placement) {
        case 'top':
            top = triggerLayout.y - tooltipLayout.height - offset
            left = triggerCenterX - tooltipLayout.width / 2
            break
        case 'bottom':
            top = triggerLayout.y + triggerLayout.height + offset
            left = triggerCenterX - tooltipLayout.width / 2
            break
        case 'left':
            top = triggerCenterY - tooltipLayout.height / 2
            left = triggerLayout.x - tooltipLayout.width - offset
            break
        case 'right':
            top = triggerCenterY - tooltipLayout.height / 2
            left = triggerLayout.x + triggerLayout.width + offset
            break
    }

    // 2. Корректируем позицию, чтобы тултип не выходил за границы экрана
    left = Math.max(safeAreaPadding, left) // Не левее левого края
    left = Math.min(left, screenWidth - tooltipLayout.width - safeAreaPadding) // Не правее правого края
    top = Math.max(statusBarHeight + safeAreaPadding, top) // Не выше верхнего края (с учетом статус-бара)
    top = Math.min(top, screenHeight - tooltipLayout.height - safeAreaPadding) // Не ниже нижнего края

    // 3. Повторное центрирование (если возможно после корректировки границ)
    // Это помогает сохранить центровку, если корректировка границ была незначительной
    if (placement === 'top' || placement === 'bottom') {
        const idealLeft = triggerCenterX - tooltipLayout.width / 2
        // Если идеальная позиция все еще в границах, используем ее
        if (idealLeft >= safeAreaPadding && idealLeft <= screenWidth - tooltipLayout.width - safeAreaPadding) {
            left = idealLeft
        }
    } else if (placement === 'left' || placement === 'right') {
        const idealTop = triggerCenterY - tooltipLayout.height / 2
        // Если идеальная позиция все еще в границах, используем ее
        if (idealTop >= statusBarHeight + safeAreaPadding && idealTop <= screenHeight - tooltipLayout.height - safeAreaPadding) {
            top = idealTop
        }
    }

    return { top, left }
}


export function Tooltip({
    textKey,
    children,
    placement = 'top',
    variant = 'default',
    size = 'md',
    className,
    offset = 8, // Немного увеличим стандартный offset для наглядности
    on = 'press',
    longPressDelayMs = 500,
    ...pressableProps
}: TooltipProps) {
    const { t } = useTranslation()
    const [isVisible, setIsVisible] = useState(false)
    const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null)
    const [tooltipLayout, setTooltipLayout] = useState<LayoutRectangle | null>(null)
    const triggerRef = useRef<View>(null) // ref для View внутри Pressable

    const sizeClasses = getSizeClasses(size)
    const variantBgClass = getVariantClasses(variant)

    // Измеряем триггер и показываем тултип
    const showTooltip = useCallback(() => {
        // Сбрасываем layout тултипа перед новым измерением триггера
        // чтобы при повторном открытии позиция пересчиталась корректно
        setTooltipLayout(null)
        triggerRef.current?.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
            setTriggerLayout({ x: px, y: py, width, height })
            setIsVisible(true) // Показываем Modal, чтобы началось измерение тултипа
        })
    }, []) // Зависимости не нужны, т.к. используем только ref и setState

    // Скрываем тултип и сбрасываем layout'ы
    const hideTooltip = useCallback(() => {
        setIsVisible(false)
        // Сбрасывать layout'ы здесь не обязательно, т.к. showTooltip их сбросит/перезапишет
        // setTooltipLayout(null)
        // setTriggerLayout(null)
    }, []) // Зависимости не нужны

    // Обработчик layout для контента тултипа
    const handleTooltipLayout = useCallback((event: { nativeEvent: { layout: LayoutRectangle } }) => {
        const newLayout = event.nativeEvent.layout
        // Сохраняем layout, только если он реально изменился или еще не установлен
        if (!tooltipLayout || newLayout.width !== tooltipLayout.width || newLayout.height !== tooltipLayout.height) {
            // Используем requestAnimationFrame для батчинга обновления состояния
            // Это может помочь избежать лишних пересчетов, если layout меняется быстро
            requestAnimationFrame(() => {
                setTooltipLayout(newLayout)
            })
        }
    }, [tooltipLayout]) // Зависимость от tooltipLayout

    // Вычисляем позицию только когда ОБА layout'а известны
    const tooltipPosition = triggerLayout && tooltipLayout
        ? calculateTooltipPosition(triggerLayout, tooltipLayout, placement, offset)
        : null // Если чего-то нет, позиция не определена

    const triggerProps = {
        ref: triggerRef,
        collapsable: false, // Важно для measure на Android
        accessibilityLabel: t(textKey), // Добавляем accessibility для тултипа
        accessibilityHint: t('tooltip.accessibilityHint'), // Подсказка для скринридеров
        ...(on === 'press'
            ? { onPress: showTooltip }
            : { onLongPress: showTooltip, delayLongPress: longPressDelayMs }
        ),
        ...pressableProps,
    }

    return (
        <>
            {/* Обертка для триггера - используем Pressable */}
            <Pressable {...triggerProps}>
                {children}
            </Pressable>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={hideTooltip}
                // Добавим поддержку аппаратного ускорения на Android, если возможно
                hardwareAccelerated
                // statusBarTranslucent позволяет модальному окну рисоваться под статус-баром (важно для позиционирования)
                statusBarTranslucent
            >
                {/* Фон для закрытия */}
                <Pressable style={{ flex: 1 }} onPress={hideTooltip} accessibilityLabel={t('tooltip.close')} />

                {/*
                  Контейнер тултипа рендерится только когда isVisible = true.
                  onLayout срабатывает, устанавливает tooltipLayout.
                  Затем пересчитывается tooltipPosition.
                  View позиционируется абсолютно и появляется (opacity: 1).
                */}
                {isVisible && ( // Начинаем рендер содержимого, как только Modal видим
                    <StyledView // Используем наш кастомный View
                        // Важно: Измеряем именно этот View
                        onLayout={handleTooltipLayout}
                        style={{
                            position: 'absolute',
                            // Позиция применяется только когда tooltipPosition рассчитан
                            top: tooltipPosition?.top,
                            left: tooltipPosition?.left,
                            // Появляется плавно только после измерения и расчета позиции
                            opacity: tooltipPosition && tooltipLayout ? 1 : 0,
                            // Если позиция еще не рассчитана, скрываем View очень далеко, чтобы onLayout сработал
                            // но он не был виден или кликабелен в неправильном месте.
                            ...(!tooltipPosition && { top: -9999, left: -9999 }),
                            zIndex: 1000,
                        }}
                        // Стили из variant и size
                        className={cn(
                            'rounded-md shadow-md dark:shadow-lg',
                            variantBgClass,
                            sizeClasses.container,
                            className
                        )}
                        // Добавляем роль для доступности
                        accessibilityRole="tooltip"
                    >
                        <Text
                            variant="default"
                            size={sizeClasses.text}
                        >
                            {t(textKey)}
                        </Text>
                    </StyledView>
                )}
            </Modal>
        </>
    )
}
