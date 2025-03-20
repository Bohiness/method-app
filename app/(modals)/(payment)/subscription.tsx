import { SubscriptionScreen } from '@features/screens/SubscriptionScreen'
import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType'
import { FullScreenModalHeaderWithNoise } from '@shared/ui/modals/FullScreenModalHeaderWithNoise'
import { ToggleSwitch } from '@shared/ui/toggle-switch'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export default function SubscriptionModal() {
    const params = useLocalSearchParams<{ selectedPlan?: SubscriptionPlan, text?: string }>()
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
        params.selectedPlan as SubscriptionPlan || 'premium'
    )
    const navigation = useNavigation()
    const { t } = useTranslation()

    // Обработчик для закрытия только текущего модального окна
    const handleClose = () => {
        // Используем navigation.goBack() вместо router.back()
        // Это должно закрыть только текущее модальное окно
        navigation.goBack()
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Добавляем заголовок напрямую в компонент */}
            <FullScreenModalHeaderWithNoise
                variant='surface'
                centerContent={
                    <ToggleSwitch
                        value={selectedPlan === 'premium_ai'}
                        onChange={(isChecked) => setSelectedPlan(isChecked ? 'premium_ai' : 'premium')}
                        leftLabel={t('screens.subscription.toggle.premium')}
                        rightLabel={t('screens.subscription.toggle.premium_ai')}
                        size="md"
                        disabled={false}
                    />
                }
                onClose={handleClose}
            />

            {/* Основной контент */}
            <SubscriptionScreen
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                text={params.text}
            />
        </View>
    )
}