import { HeaderMenuItem } from '@features/nav/HeaderMenuItem'
import { GENDER_OPTIONS } from '@shared/constants/user/GENDER_OPTIONS'
import { useUser } from '@shared/context/user-provider'
import { Gender } from '@shared/types/user/UserType'
import { Button } from '@shared/ui/button'
import { RadioGroup } from '@shared/ui/radio'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, View } from 'react-native'

interface EditGenderProps {
    onBack: () => void
    title: string
}

export const EditGender = ({
    onBack,
    title,
}: EditGenderProps) => {
    const { user, updateUser } = useUser()
    const { t } = useTranslation()
    const [gender, setGender] = useState(user?.gender || '')
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (gender.length === 0) {
            setError(t('validation.requiredField'))
            return
        }

        setLoading(true)
        try {
            await updateUser({ gender: gender as Gender })
            onBack()
        } catch (error) {
            console.error(`Error updating names:`, error)
            setError(t('common.errors.saveFailed'))
        } finally {
            setLoading(false)
        }
    }

    const canSave = (gender !== user?.gender) &&
        !error &&
        gender.length > 0

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background dark:bg-background-dark"
        >
            <HeaderMenuItem onBack={onBack} title={title} />

            <View className="mt-6 flex-1">
                <View className="flex-1 gap-y-4">
                    <RadioGroup
                        options={GENDER_OPTIONS}
                        value={gender}
                        onChange={setGender}
                        label={t('profile.editGender')}
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