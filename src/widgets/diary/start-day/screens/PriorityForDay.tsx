// src/widgets/diary/steps/SleepQualityStep.tsx
import { Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { useTranslation } from 'react-i18next'


export const PriorityForDay: React.FC = () => {
    const { t } = useTranslation()

    return (
        <View className="p-4 space-y-8">
            <Title>
                {t('diary.startday.priority.title')}
            </Title>
        </View>
    )
}