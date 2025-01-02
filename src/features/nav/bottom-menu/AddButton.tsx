import { useTheme } from '@shared/context/theme-provider'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Plus } from 'lucide-react-native'
import { View } from 'react-native'

export const AddButton = () => {
    const { colors } = useTheme()

    return (
        <View className="
            absolute 
            bottom-5 
            self-center 
            bg-background-dark
            dark:bg-background
            w-16
            h-16
            rounded-full 
            justify-center 
            items-center 
            shadow-lg
        ">
            <HapticTab
                onPress={() => {
                    // Обработка нажатия
                }}
                className="
                    w-full 
                    h-full 
                    justify-center 
                    items-center
                "
            >
                <Plus
                    size={30}
                    color={colors.background}
                />
            </HapticTab>
        </View>
    )
}