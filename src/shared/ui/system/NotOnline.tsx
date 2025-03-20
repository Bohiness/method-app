import { useNetwork } from '@shared/hooks/systems/network/useNetwork'
import { Icon } from '../icon'

export const NotOnline = () => {
    const { isOnline } = useNetwork()

    if (isOnline) return null

    return (
        <Icon
            name='WifiOff'
            variant='error'
        />
    )
}