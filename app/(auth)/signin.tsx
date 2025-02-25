// src/app/profile.tsx

import { SignInScreen } from '@features/screens/SignInScreen'
import { WebSignIn } from '@shared/lib/user/WebSignIn'
import { Platform } from 'react-native'

export default function ProfileScreen() {
    if (Platform.OS === 'web') {
        return <WebSignIn />
    }

    return (
        <SignInScreen />
    )
}