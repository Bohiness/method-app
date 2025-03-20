import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { View } from '@shared/ui/view'
import { BeautifulDiary } from '@widgets/diary/BeautifulDiary'
import { useTranslation } from 'react-i18next'

export function DiaryScreen({ onBack, title }: { onBack: () => void, title: string }) {
    const { t } = useTranslation()

    return (
        <View className="flex-1">
            <HeaderMenuItem onBack={onBack} title={t('diary.history.lastWeekEntries')} />
            <BeautifulDiary />
        </View>
    )
}