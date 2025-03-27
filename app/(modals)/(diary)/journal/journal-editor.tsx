import { ModalFullScreenContent } from '@entities/modals/modal-full-screen-content'
import JournalEditor from '@features/diary/JournalEditor'
import { Text } from '@shared/ui/text'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
export default function JournalEditorModal() {
    const { t } = useTranslation()
    const [showSavedMessage, setShowSavedMessage] = useState(false) // Состояние для отображения сообщения о сохранении

    return (
        <ModalFullScreenContent
            headerOnClose={async () => {
                // Импортируем journalEditorState и используем его
                const { journalEditorState } = require('@features/diary/JournalEditor')
                if (journalEditorState.saveHandler) {
                    await journalEditorState.saveHandler()
                }
                router.dismissTo('/(tabs)')
            }}
            headerLeftContent={
                showSavedMessage &&
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <Text size="sm" variant="secondary">{t('diary.journal.draftSaved')}</Text>
                </Animated.View>
            }
        >
            <JournalEditor onSaveDraft={setShowSavedMessage} />
        </ModalFullScreenContent>
    )
}