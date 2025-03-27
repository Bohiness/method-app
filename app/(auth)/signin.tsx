// src/app/profile.tsx

import { ModalBottomScreenContent } from '@entities/modals/modal-bottom-screen-content'
import { SignInScreen } from '@features/screens/SignInScreen'

export default function ProfileScreen() {

    return (
        <ModalBottomScreenContent>
            <SignInScreen />
        </ModalBottomScreenContent>
    )
}