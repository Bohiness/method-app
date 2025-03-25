import JournalEditor from '@features/diary/JournalEditor'
import { ModalFullScreenView } from '@shared/ui/view'

export default function JournalEditorModal() {

    return (
        <ModalFullScreenView>
            <JournalEditor />
        </ModalFullScreenView>
    )
}