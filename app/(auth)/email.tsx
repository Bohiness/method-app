import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { LoginForm } from '@widgets/auth/LoginForm'

export default function ProfileScreen() {

    return (
        <ModalBottomScreenContent>
            <LoginForm />
        </ModalBottomScreenContent>
    )
}