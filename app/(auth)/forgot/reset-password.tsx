import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { ResetPasswordScreen } from '@widgets/auth/ResetPasswordScreen'

export default function ResetPassword() {
    return (
        <ModalBottomScreenContent>
            <ResetPasswordScreen />
        </ModalBottomScreenContent>
    )
}