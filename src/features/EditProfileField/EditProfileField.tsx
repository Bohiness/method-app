import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useUser } from '@shared/context/user-provider'
import { UserType } from '@shared/types/user/UserType'
import { Button } from '@shared/ui/button'
import { TextInput } from '@shared/ui/text-input'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, View } from 'react-native'

interface EditProfileFieldProps {
    onBack: () => void
    field: keyof UserType
    title: string
    placeholder?: string
    validator?: (value: string) => string | undefined
    onSave: (value: string) => Promise<void>
}

export const EditProfileField = ({
    onBack,
    field,
    title,
    placeholder,
    validator,
    onSave
}: EditProfileFieldProps) => {
    const { user } = useUser()
    const { t } = useTranslation()
    const [value, setValue] = useState(user?.[field]?.toString() || '')
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        // Валидация
        if (validator) {
            const validationError = validator(value)
            if (validationError) {
                setError(validationError)
                return
            }
        }

        setLoading(true)
        try {
            await onSave(value)
            onBack()
        } catch (error) {
            console.error(`Error updating ${field}:`, error)
            setError(t('common.errors.saveFailed'))
        } finally {
            setLoading(false)
        }
    }

    const canSave = value !== user?.[field]?.toString() && !error && value.length > 0

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background dark:bg-background-dark"
        >
            <HeaderMenuItem onBack={onBack} title={title} />

            <View className="mt-6 flex-1">
                <TextInput
                    value={value}
                    onChangeText={(text) => {
                        setValue(text)
                        setError(undefined)
                    }}
                    placeholder={placeholder}
                    error={error}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Button
                    onPress={handleSave}
                    disabled={!canSave}
                    className="mt-5"
                    loading={loading}
                >
                    {t('common.save')}
                </Button>
            </View>
        </KeyboardAvoidingView>
    )
}