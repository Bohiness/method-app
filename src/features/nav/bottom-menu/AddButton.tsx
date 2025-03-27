// src/features/nav/bottom-menu/AddButton.tsx
import { useAddMenu } from '@shared/context/add-menu-context'
import { useTheme } from '@shared/context/theme-provider'
import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon } from '@shared/ui/icon'
import { View } from '@shared/ui/view'
import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const AddButton = () => {
    const { colors } = useTheme()
    const { isVisible, show, hide, currentTab, createNewTask } = useAddMenu()
    const insets = useSafeAreaInsets()
    const rotateAnim = useRef(new Animated.Value(0)).current

    // Обновляем анимацию при изменении состояния
    useEffect(() => {
        Animated.spring(rotateAnim, {
            toValue: isVisible ? 1 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7
        }).start()
    }, [isVisible])

    const handlePress = () => {
        // Если мы на странице plans, сразу открываем форму создания задачи
        if (currentTab === 'plans') {
            createNewTask()
        } else {
            // На других страницах показываем/скрываем меню как обычно
            if (isVisible) {
                hide()
            } else {
                show()
            }
        }
    }

    // Настраиваем интерполяцию для плавного вращения
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
    })

    return (
        <View variant='inverse' className={`
            absolute
            self-center
            w-16 h-16
            rounded-full
            justify-center
            items-center
            shadow-lg
            z-[1001]
        `}
            style={{ bottom: insets.bottom }}
        >
            <HapticTab
                onPress={handlePress}
                hapticStyle="medium"
                className="
                    w-full
                    h-full
                    justify-center
                    items-center
                "
            >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon
                        name='Plus'
                        size={30}
                        color={colors.background}
                    />
                </Animated.View>
            </HapticTab>
        </View>
    )
}