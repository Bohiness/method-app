import { ModalBottomContentView } from '@shared/ui/view'
import { LoginForm } from '@widgets/auth/LoginForm'



export default function ProfileScreen() {

    return (
        <ModalBottomContentView showHeader className='px-4'>
            <LoginForm />
        </ModalBottomContentView>
    )
}