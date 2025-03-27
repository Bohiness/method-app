// src/shared/context/add-menu-context.tsx
import { APP_ROUTES } from '@shared/constants/system/app-routes'
import { router } from 'expo-router'
import React, { createContext, useContext, useState } from 'react'

interface AddMenuContextType {
    isVisible: boolean
    show: () => void
    hide: () => void
    currentTab: string | null
    setCurrentTab: (tab: string) => void
    createNewTask: () => void
}

const AddMenuContext = createContext<AddMenuContextType | undefined>(undefined)

export function AddMenuProvider({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(false)
    const [currentTab, setCurrentTab] = useState<string | null>(null)

    const show = () => setIsVisible(true)
    const hide = () => setIsVisible(false)

    const createNewTask = () => {
        hide()
        router.push(`/${APP_ROUTES.MODALS.PLANS.NEW_TASK}`)
    }

    return (
        <AddMenuContext.Provider value={{
            isVisible,
            show,
            hide,
            currentTab,
            setCurrentTab,
            createNewTask
        }}>
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
