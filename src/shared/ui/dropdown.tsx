// src/shared/ui/dropdown/index.tsx
import React, { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'

interface DropdownProps {
    items: Array<{ label: string; value: string }>
    placeholder?: string
    onSelect?: (value: any) => void
}

export const Dropdown: React.FC<DropdownProps> = ({
    items: initialItems,
    placeholder,
    onSelect
}) => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(null)
    const [items, setItems] = useState(initialItems)

    return (
        <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={(val) => {
                setValue(val)
                onSelect?.(val)
            }}
            setItems={setItems}
            placeholder={placeholder}
            className="border border-neutral-200"
            textStyle={{
                fontSize: 16,
                color: '#374151'
            }}
        />
    )
}
