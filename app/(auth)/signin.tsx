// src/app/profile.tsx

import { SignInScreen } from '@features/screens/SignInScreen'
import { ModalBottomContentView } from '@shared/ui/view'

export default function ProfileScreen() {

    return (
        <ModalBottomContentView showHeader>
            <SignInScreen />
        </ModalBottomContentView>
    )
}