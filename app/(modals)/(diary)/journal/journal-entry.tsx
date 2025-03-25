import { useJournal } from '@shared/hooks/diary/journal/useJournal'
import { useDateTime } from '@shared/hooks/systems/datetime/useDateTime'
import { Text } from '@shared/ui/text'
import TextEditor from '@shared/ui/text-editor'
import { Container, ModalBottomContentView, View } from '@shared/ui/view'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function JournalEntry() {
    const { journalId } = useLocalSearchParams()
    const { getDetails } = useJournal()
    const { formateDataTimeWithTimezoneAndLocale } = useDateTime()
    const { t } = useTranslation()

    if (!journalId) {
        return <Text>{t('common.error.no_journal_id')}</Text>
    }

    const { data: journal, isPending } = getDetails(Number(journalId))

    if (isPending) {
        return <Text>{t('common.loading')}</Text>
    }

    if (!journal) {
        return <Text>{t('common.error.no_journal_found')}</Text>
    }

    return (
        <ModalBottomContentView showHeader>
            <Container className='flex-1'>
                <Text>{formateDataTimeWithTimezoneAndLocale(journal.created_at, 'dd MMMM yyyy')} {t('common.date.at')} {formateDataTimeWithTimezoneAndLocale(journal.created_at, 'HH:mm')}</Text>
                <View className='flex-1'>
                    <TextEditor
                        initialContent={journal.content}
                        disabled
                    />
                </View>
            </Container>
        </ModalBottomContentView>
    )
}   