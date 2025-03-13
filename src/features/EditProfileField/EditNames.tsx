import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { useUser } from '@shared/context/user-provider'
import { Button } from '@shared/ui/button'
import { TextInput } from '@shared/ui/text-input'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, View } from 'react-native'

interface EditNamesProps {
    onBack: () => void
    title: string
}

export const EditNames = ({
    onBack,
    title,
}: EditNamesProps) => {
    const { user, updateUser } = useUser()
    const { t } = useTranslation()
    const [firstName, setFirstName] = useState(user?.first_name || '')
    const [lastName, setLastName] = useState(user?.last_name || '')
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (firstName.length === 0 || lastName.length === 0) {
            setError(t('validation.requiredField'))
            return
        }

        setLoading(true)
        try {
            await updateUser({ first_name: firstName, last_name: lastName })
            onBack()
        } catch (error) {
            console.error(`Error updating names:`, error)
            setError(t('common.errors.saveFailed'))
        } finally {
            setLoading(false)
        }
    }

    const canSave = (firstName !== user?.first_name || lastName !== user?.last_name) &&
        !error &&
        firstName.length > 0 &&
        lastName.length > 0

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background dark:bg-background-dark"
        >
            <HeaderMenuItem onBack={onBack} title={title} />

            <View className="mt-6 flex-1">
                <View className="flex-1 gap-y-4">
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        label={t('profile.edit.names.placeholder')}
                        placeholder={t('profile.edit.names.placeholder')}
                        error={error}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        label={t('profile.edit.names.placeholder2')}
                        placeholder={t('profile.edit.names.placeholder2')}
                        error={error}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
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