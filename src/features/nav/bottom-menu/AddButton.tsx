import { HapticTab } from '@ui/system/HapticTab'
import { Plus } from 'lucide-react-native'
import { View } from 'react-native'

// Компонент центральной кнопки с тактильной отдачей
export const AddButton = () => (
    <View style={{
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#ffffff',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }}>
        <HapticTab
            onPress={() => {
                // Обработка нажатия
            }}
            style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Plus
                size={30}
                color="#000000"
            />
        </HapticTab>
    </View>
)
