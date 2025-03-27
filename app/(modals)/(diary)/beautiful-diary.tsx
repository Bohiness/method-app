import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { BeautifulDiary } from '@widgets/diary/BeautifulDiary'
import { useTranslation } from 'react-i18next'

export default function BeautifulDiaryScreen() {
    const { t } = useTranslation()
    return (
        <ModalBottomScreenContent title={t('diary.beautifuldiary.title')}>
            <BeautifulDiary />
        </ModalBottomScreenContent>
    )
}
