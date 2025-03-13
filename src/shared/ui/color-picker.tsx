import { View } from '@shared/ui/view'

import { ScrollView, TouchableOpacity } from 'react-native'
import { Caption } from './text'

const PROJECT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
    '#1ABC9C', '#F1C40F', '#E74C3C', '#34495E', '#95A5A6',
]

interface ColorPickerProps {
    colors?: string[]
    selectedColor?: string
    onSelectColor: (color: string) => void
    label?: string
}

export function ColorPicker({
    colors = PROJECT_COLORS,
    selectedColor = colors === PROJECT_COLORS ? PROJECT_COLORS[0] : colors[0],
    onSelectColor,
    label
}: ColorPickerProps) {

    return (
        <View>
            {label && (
                <Caption className='mb-2'>
                    {label}
                </Caption>
            )}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-x-3"
            >
                {colors.map((color) => (
                    <TouchableOpacity
                        key={color}
                        onPress={() => onSelectColor(color)}
                        className="p-1"
                    >
                        <View
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                backgroundColor: color,
                                padding: 2,
                            }}
                        >
                            {selectedColor === color && (
                                <View
                                    style={{
                                        flex: 1,
                                        borderRadius: 15,
                                        borderWidth: 2,
                                        borderColor: 'white',
                                        backgroundColor: color
                                    }}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
}