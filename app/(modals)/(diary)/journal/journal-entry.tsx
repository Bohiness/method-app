import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { BeautifulEntryStats } from '@features/diary/BeautifulEntryStats'
import { useJournal } from '@shared/hooks/diary/journal/useJournal'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import HTMLView from '@shared/lib/utils/parsers/HTMLView'
import { Skeleton } from '@shared/ui/skeleton'
import { Text } from '@shared/ui/text'
import { Tooltip } from '@shared/ui/tooltip'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'

export default function JournalEntry() {
    const { journalId } = useLocalSearchParams()
    const { getDetails } = useJournal()
    const { formatDateTimeWithTimezoneAndLocale } = useDateTime()
    const { t } = useTranslation()

    if (!journalId) {
        return <Text>{t('common.error.no_journal_id')}</Text>
    }

    const { data: journal, isPending } = getDetails(Number(journalId))

    const title = journal?.created_at ? formatDateTimeWithTimezoneAndLocale(journal?.created_at, 'dd MMMM yyyy') + ' ' + t('common.date.at') + ' ' + formatDateTimeWithTimezoneAndLocale(journal?.created_at, 'HH:mm') : ''

    if (isPending) {
        return <Skeleton className="h-full" />
    }

    if (!journal) {
        return <Text>{t('common.error.no_data')}</Text>
    }

    return (
        <ModalBottomScreenContent title={title}>
            <ScrollView className="mb-5" showsVerticalScrollIndicator={false}>
                <BeautifulEntryStats data={journal} />
                <Tooltip textKey="diary.journal.entry.tooltip" placement="top">
                    <HTMLView html={journal?.content || ''} />
                </Tooltip>
            </ScrollView>
        </ModalBottomScreenContent>
    )
}   