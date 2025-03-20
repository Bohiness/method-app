import { BottomButton } from '@entities/modals/bottom-button'
import { UniversalScreen } from '@features/screens/UniversalScreen'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from '@shared/ui/view'
import { EveningReflectionStackParamList } from '../StepNavigator'

// Тип для параметров компонента экрана
type ScreenProps = NativeStackScreenProps<EveningReflectionStackParamList, keyof EveningReflectionStackParamList>

// Обертка для UniversalScreen с кнопками навигации
interface EnhancedUniversalScreenProps {
    topContent: React.ReactNode
    inputValue: string
    onInputChange: (text: string) => void
    placeholder?: string
    navigation: ScreenProps['navigation']
    nextScreen?: keyof EveningReflectionStackParamList
    isLastScreen?: boolean
    onComplete?: () => void
}

export default function EnhancedUniversalScreen({
    topContent,
    inputValue,
    onInputChange,
    placeholder,
    navigation,
    nextScreen,
    isLastScreen = false,
    onComplete
}: EnhancedUniversalScreenProps) {
    return (
        <View className="flex-1" variant='default'>
            <View className="flex-1">
                <UniversalScreen
                    topContent={topContent}
                    inputValue={inputValue}
                    onInputChange={onInputChange}
                    placeholder={placeholder}
                />
            </View>

            <BottomButton
                onNext={() => {
                    if (nextScreen) {
                        navigation.navigate(nextScreen, { date: new Date() })
                    }
                    if (onComplete) {
                        onComplete()
                    }
                }}
                onBack={() => navigation.goBack()}
                enabledNextButton={true}
                canSkip={false}
                canBack={false}
                showButtonBlock={true}
            />
        </View>
    )
}