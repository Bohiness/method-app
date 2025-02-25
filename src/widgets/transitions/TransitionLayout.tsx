import { useEffect, useState } from 'react'
import { TransitionContent } from './TransitionContent'
import { TransitionProvider, TransitionScreen } from './TransitionContext'

// TransitionLayout.tsx
export interface TransitionLayoutProps {
    screens: TransitionScreen[]
    onComplete?: () => Promise<void>
}

// TransitionLayout.tsx
export const TransitionLayout = ({ screens, onComplete }: TransitionLayoutProps) => {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 50)
        return () => clearTimeout(timer)
    }, [])

    if (!isReady) return null

    return (
        <TransitionProvider screenKeys={screens.map(s => s.key)} onComplete={onComplete}>
            <TransitionContent screens={screens} />
        </TransitionProvider>
    )
}
