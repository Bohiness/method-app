import { SelectedFactors, SelectedFactorsBadges } from '@features/diary/SelestedFactors'
import { useFactors } from '@shared/hooks/diary/mood/useFactors'
import { Button } from '@shared/ui/button'
import { IconButtonWithText } from '@shared/ui/button-icon-with-text'
import { IconName } from '@shared/ui/icon'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'

interface FactorsScrollViewProps {
    selectedFactors: number[]
    /**
     * Функция, вызываемая при выборе или отмене выбора фактора.
     * Компонент FactorsScrollView сам обрабатывает логику выбора/отмены выбора.
     * @param updatedFactors - Обновленный массив выбранных факторов
     */
    onSelect: (id: number) => void
    iconView?: boolean
    search?: boolean
    showSelectedFactors?: boolean
    showSelectedFactorsBadges?: boolean
    showSelectedFactorsTitle?: boolean
}

export function FactorsScrollView({ selectedFactors, onSelect, iconView = false, search = false, showSelectedFactors = false, showSelectedFactorsBadges = false, showSelectedFactorsTitle = false }: FactorsScrollViewProps) {
    const { t } = useTranslation()
    const { factors } = useFactors()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredFactors = factors.filter(factor =>
        factor.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSelect = (id: number) => {
        // Обрабатываем выбор/отмену выбора фактора внутри компонента
        if (selectedFactors.includes(id)) {
            // Если фактор уже выбран, отменяем выбор
            onSelect(id)
        } else {
            // Если фактор не выбран, выбираем его
            onSelect(id)
        }
    }

    // Сортируем факторы по имени
    const sortedFactors = filteredFactors.sort((a, b) => a.name.localeCompare(b.name))

    // Группируем факторы по 4 в ряд для режима иконок
    const groupedFactors = iconView
        ? Array.from({ length: Math.ceil(sortedFactors.length / 4) }, (_, i) =>
            sortedFactors.slice(i * 4, i * 4 + 4)
        )
        : null

    return (
        <View className='flex-1' variant='default'>
            {showSelectedFactors && (
                <SelectedFactors
                    selectedFactors={selectedFactors}
                    factors={factors}
                    onRemoveFactor={onSelect}
                    showTitle={showSelectedFactorsTitle}
                />
            )}

            {showSelectedFactorsBadges && (
                <SelectedFactorsBadges
                    selectedFactors={selectedFactors}
                    factors={factors}
                    onRemoveFactor={onSelect}
                    showTitle={showSelectedFactorsTitle}
                />
            )}

            {search && (
                <TextInput
                    placeholder={t('search')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    variant='underline'
                    className="mb-4"
                    containerClassName='px-4'
                    clearButton
                />
            )}

            <ScrollView
                className="flex-1 mb-6"
                showsVerticalScrollIndicator={false}
            >
                {!iconView ? (
                    <View className="flex-row flex-wrap gap-2 gap-y-4">
                        {sortedFactors.map((factor) => (
                            <Button
                                key={factor.id}
                                onPress={() => handleSelect(factor.id)}
                                variant={selectedFactors.includes(factor.id) ? "default" : "secondary"}
                            >
                                {factor.name}
                            </Button>
                        ))}
                    </View>
                ) : (
                    <View className="flex-col gap-y-6">
                        {groupedFactors?.map((group, groupIndex) => (
                            <View key={groupIndex} className="flex-row justify-between px-4">
                                {group.map((factor) => (
                                    <IconButtonWithText
                                        key={factor.id}
                                        onPress={() => handleSelect(factor.id)}
                                        variant={selectedFactors.includes(factor.id) ? "default" : "outline"}
                                        icon={factor.icon as IconName}
                                        className="flex-1"
                                    >
                                        {factor.name}
                                    </IconButtonWithText>
                                ))}
                                {/* Добавляем пустые элементы, чтобы заполнить ряд, если в последнем ряду меньше 4 элементов */}
                                {group.length < 4 && Array.from({ length: 4 - group.length }).map((_, i) => (
                                    <View key={`empty-${i}`} className="flex-1 mx-1" />
                                ))}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}