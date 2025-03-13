import { HABIT_ICONS } from '@shared/constants/habit-icons'
import { cn } from '@shared/lib/utils/cn'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import * as LucideIcons from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Modal,
    Pressable,
    View as RNView,
    ScrollView,
    useColorScheme
} from 'react-native'
import { Button } from './button'
import { Caption, Text } from './text'
import { TextInput } from './text-input'

export interface IconPickerProps {
    value?: string
    onChange: (iconName: string) => void
    placeholder?: string
    className?: string
    label?: string
    styles?: {
        container?: string
        modalContainer?: string
        modalContent?: string
        searchInput?: string
        groupHeader?: string
        iconGrid?: string
        iconItem?: string
        selectedIcon?: string
    }
    /**
     * Входящие иконки могут быть либо объектом (например, весь модуль lucide-react-native),
     * либо массивом строк (например, базовый набор иконок для привычек).
     */
    icons?: typeof LucideIcons | string[]
}

export const IconPicker = ({
    value,
    onChange,
    placeholder,
    className,
    styles,
    label,
    icons
}: IconPickerProps) => {
    const { t } = useTranslation()
    const [modalVisible, setModalVisible] = useState(false)
    const [searchText, setSearchText] = useState('')

    // Определяем, что использовать: если пропс icons передан, то его, иначе базовый набор HABIT_ICONS
    const defaultIcons = useMemo(() => {
        return icons ? icons : HABIT_ICONS
    }, [icons])

    // Вычисляем список имён иконок
    const iconNames = useMemo(() => {
        if (Array.isArray(defaultIcons)) {
            return defaultIcons
        } else {
            // Если передали объект, фильтруем ключи, оставляя только допустимые компоненты
            return Object.keys(defaultIcons).filter(
                (key) => typeof (defaultIcons as any)[key] === 'function'
            )
        }
    }, [defaultIcons])

    const isArrayIcons = useMemo(() => Array.isArray(defaultIcons), [defaultIcons])

    // Определяем библиотеку для рендера: если icons передан как объект, используем его, иначе — LucideIcons
    const iconLibrary = useMemo(() => {
        if (!isArrayIcons) {
            return defaultIcons as any
        }
        return LucideIcons
    }, [defaultIcons, isArrayIcons])

    // Фильтрация иконок по поисковому запросу
    const filteredIcons = useMemo(() => {
        if (searchText) {
            return iconNames.filter((name) =>
                name.toLowerCase().includes(searchText.toLowerCase())
            )
        }
        return iconNames
    }, [searchText, iconNames])

    // Если icons переданы как объект (например, весь модуль lucide-react-native) и нет поискового запроса – группируем по первой букве
    const groupedIcons = useMemo(() => {
        if (searchText || isArrayIcons) return null
        const groups: { [key: string]: string[] } = {}
        iconNames.forEach((name) => {
            const groupKey = name.charAt(0).toUpperCase()
            if (!groups[groupKey]) {
                groups[groupKey] = []
            }
            groups[groupKey].push(name)
        })
        Object.keys(groups).forEach((key) =>
            groups[key].sort((a, b) => a.localeCompare(b))
        )
        return groups
    }, [searchText, iconNames, isArrayIcons])

    // Значения стилей по умолчанию
    const defaultStyles = {
        container: "rounded-2xl p-4 border border-border dark:border-border-dark",
        modalContainer: "flex-1 justify-center items-center bg-background dark:bg-background-dark",
        modalContent: "bg-background dark:bg-background-dark rounded-2xl p-4 max-h-[80%] w-[90%]",
        groupHeader: "text-xl font-semibold mt-4 mb-2",
        iconGrid: "flex-row flex-wrap",
        iconItem: "w-16 h-16 justify-center items-center m-1",
        selectedIcon: "bg-primary p-1 rounded"
    }
    const mergedStyles = cn(defaultStyles, className, styles)

    // Определяем цвет иконок, используя текстовый цвет в зависимости от темы
    const colorScheme = useColorScheme()
    const iconColor = colorScheme === 'dark' ? '#fff' : '#000'

    const selectIcon = (iconName: string) => {
        onChange(iconName)
        setModalVisible(false)
        setSearchText('')
    }

    const renderSelectedIcon = () => {
        if (!value) return null
        const IconComponent = iconLibrary[value]
        if (!IconComponent) return null
        return <IconComponent size={24} color={iconColor} />
    }

    return (
        <RNView>
            {label && <Caption className="mb-2">{label}</Caption>}
            <HapticTab
                onPress={() => setModalVisible(true)}
                className={cn(defaultStyles.container, className, styles?.container)}
            >
                <RNView className="flex-row items-center gap-x-2">
                    {renderSelectedIcon()}
                    <Text>{value || placeholder || t('components.iconPicker.placeholder')}</Text>
                </RNView>
            </HapticTab>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    className={cn(defaultStyles.modalContainer, styles?.modalContainer)}
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        className={cn(defaultStyles.modalContent, styles?.modalContent)}
                    >
                        <TextInput
                            placeholder={t('components.iconPicker.searchPlaceholder')}
                            value={searchText}
                            onChangeText={setSearchText}
                            variant='ghost'
                            size='sm'
                        />
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            className="h-[500px]"
                        >
                            {searchText || isArrayIcons ? (
                                // Если есть поисковый запрос или icons переданы как массив – выводим простой grid
                                <RNView className={cn(defaultStyles.iconGrid, styles?.iconGrid)}>
                                    {filteredIcons.length > 0 ? (
                                        filteredIcons.map((iconName) => {
                                            const IconComponent = iconLibrary[iconName]
                                            return (
                                                <HapticTab
                                                    key={iconName}
                                                    onPress={() => selectIcon(iconName)}
                                                    className={
                                                        cn(defaultStyles.iconItem, styles?.iconItem) +
                                                        " " +
                                                        (value === iconName
                                                            ? cn(defaultStyles.selectedIcon, styles?.selectedIcon)
                                                            : "")
                                                    }
                                                >
                                                    {IconComponent && <IconComponent size={24} color={iconColor} />}
                                                </HapticTab>
                                            )
                                        })
                                    ) : (
                                        <Text>{t('components.iconPicker.noResults')}</Text>
                                    )}
                                </RNView>
                            ) : groupedIcons ? (
                                // Если icons переданы как объект и нет поискового запроса – выводим сгруппированно
                                Object.keys(groupedIcons)
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((group) => (
                                        <RNView key={group}>
                                            <Text className={cn(defaultStyles.groupHeader, styles?.groupHeader)}>
                                                {group}
                                            </Text>
                                            <RNView className={cn(defaultStyles.iconGrid, styles?.iconGrid)}>
                                                {groupedIcons[group].map((iconName) => {
                                                    const IconComponent = iconLibrary[iconName]
                                                    return (
                                                        <HapticTab
                                                            key={iconName}
                                                            onPress={() => selectIcon(iconName)}
                                                            className={
                                                                cn(defaultStyles.iconItem, styles?.iconItem) +
                                                                " " +
                                                                (value === iconName
                                                                    ? cn(defaultStyles.selectedIcon, styles?.selectedIcon)
                                                                    : "")
                                                            }
                                                        >
                                                            {IconComponent && <IconComponent size={24} color={iconColor} />}
                                                        </HapticTab>
                                                    )
                                                })}
                                            </RNView>
                                        </RNView>
                                    ))
                            ) : null}
                        </ScrollView>
                        <Button variant="outline" onPress={() => setModalVisible(false)} className="mt-4">
                            {t('common.close')}
                        </Button>
                    </Pressable>
                </Pressable>
            </Modal>
        </RNView>
    )
}