import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { NewHabit } from '@entities/plans/habits/NewHabit'

export default function NewHabitModal() {
    return (
        <ModalBottomScreenContent>
            <NewHabit isVisible={true} onClose={() => { }} onSuccess={() => { }} />
        </ModalBottomScreenContent>
    )
}

