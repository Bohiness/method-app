// src/shared/context/add-menu-context.tsx
import React, { createContext, useContext, useState } from 'react'

interface AddMenuContextType {
    isVisible: boolean
    show: () => void
    hide: () => void
}

const AddMenuContext = createContext<AddMenuContextType | undefined>(undefined)

export function AddMenuProvider({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(false)

    const show = () => setIsVisible(true)
    const hide = () => setIsVisible(false)

    return (
        <AddMenuContext.Provider value={{ isVisible, show, hide }}>
            {children}
        </AddMenuContext.Provider>
    )
}

export function useAddMenu() {
    const context = useContext(AddMenuContext)
    if (!context) {
        throw new Error('useAddMenu must be used within AddMenuProvider')
    }
    return context
}
