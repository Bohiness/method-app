import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { ForgotPasswordScreen } from '@widgets/auth/ForgotPasswordScreen'

export default function ForgotPassword() {
    return (
        <ModalBottomScreenContent>
            <ForgotPasswordScreen />
        </ModalBottomScreenContent>
    )
}