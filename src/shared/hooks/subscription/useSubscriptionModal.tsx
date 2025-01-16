// src/shared/hooks/subscription/useSubscriptionModal.ts
import { SubscriptionScreen } from '@features/screens/SubscriptionScreen'
import { useModal } from '@shared/context/modal-provider'
import { useCallback } from 'react'
import { useIAP } from './useIAP'
import { useSubscription } from './useSubscription'

export const useSubscriptionModal = () => {
    const { showFullScreenModal, hideFullScreenModal } = useModal()
    const subscription = useSubscription()
    const iap = useIAP()

    const showSubscriptionModal = useCallback(() => {
        showFullScreenModal(
            <SubscriptionScreen
                subscription={subscription}
                iap={iap}
            />
        )
    }, [showFullScreenModal, subscription, iap])

    const showSubscriptionModalIfNeeded = useCallback(async () => {
        if (!subscription.hasActiveSubscription) {
            showSubscriptionModal()
            return false
        }
        return true
    }, [subscription.hasActiveSubscription, showSubscriptionModal])

    return {
        showSubscriptionModal,
        hideSubscriptionModal: hideFullScreenModal,
        showSubscriptionModalIfNeeded,
        isSubscribed: subscription.hasActiveSubscription
    }
}