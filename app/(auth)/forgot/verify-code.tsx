import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { VerifyCodeScreen } from '@widgets/auth/VerifyCodeScreen'

export default function CheckCode() {
    return (
        <ModalBottomScreenContent>
            <VerifyCodeScreen />
        </ModalBottomScreenContent>
    )
}
