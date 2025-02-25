// app/(coach)/[id].tsx
import { useCoach, usePackages } from '@shared/hooks/coaches/useCoach'
import { CoachProfile } from '@widgets/coaches/coach-screen/CoachProfile'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { Linking, Platform } from 'react-native'

export default function CoachScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { coach, isPending } = useCoach(+id)
    const { packages, isPending: isPackagesPending } = usePackages(+id)

    useEffect(() => {
        if (coach) {
            router.setParams({
                id: id,
            })
        }
    }, [coach])

    const handleBooking = () => {
        const url = `https://method.do/coach/${id}`

        if (Platform.OS === 'web') {
            window.open(url, '_blank')
        } else {
            Linking.openURL(url)
        }
    }

    // if (isPending || !coach) {
    //     return <CoachLoadingScreen />
    // }

    if (!coach) {
        return null
    }

    return (
        <CoachProfile
            coach={coach}
            packages={packages}
            isPackagesPending={isPackagesPending}
            onBookingPress={handleBooking}
        />
    )
}