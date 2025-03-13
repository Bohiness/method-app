import { HapticTab } from '@shared/lib/utils/HapticTab'
import { Icon } from '@shared/ui/icon'
import { Title } from '@shared/ui/text'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export const HeaderMenuItem = ({ onBack, title }: { onBack: () => void, title: string }) => {
    const { t } = useTranslation()

    return (
        <View>
            <HapticTab onPress={onBack} >
                <View className="flex-row items-center mb-4" >
                    <Icon
                        name="ChevronLeft"
                        className="mr-2"
                    />
                    <Title size="3xl" weight="bold">{t(title)}</Title>
                </View>
            </HapticTab>
        </View>
    )
}