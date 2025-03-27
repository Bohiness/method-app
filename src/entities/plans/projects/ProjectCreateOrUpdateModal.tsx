// src/features/projects/components/ProjectFormModal.tsx
import { useProjects } from '@shared/hooks/plans/useProjects'
import { useKeyboard } from '@shared/hooks/systems/keyboard/useKeyboard'
import { ProjectType } from '@shared/types/plans/ProjectTypes'
import { Button } from '@shared/ui/button'
import { ColorPicker } from '@shared/ui/color-picker'
import { Title } from '@shared/ui/text'
import { TextInput } from '@shared/ui/text-input'
import { View } from '@shared/ui/view'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'

interface ProjectCreateOrUpdateModalProps {
    project?: ProjectType
    isVisible: boolean
    onClose: () => void
    onSuccess: (project: ProjectType) => void
}

export function ProjectCreateOrUpdateModal({ project, isVisible, onClose, onSuccess }: ProjectCreateOrUpdateModalProps) {
    if (!isVisible) return null
    const { t } = useTranslation()
    const { createProject, updateProject } = useProjects()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedColor, setSelectedColor] = useState('')
    const { isKeyboardVisible, hideKeyboard } = useKeyboard()

    const isEditMode = !!project

    // Заполняем форму данными проекта при редактировании
    useEffect(() => {
        if (project) {
            setName(project.name)
            setDescription(project.description || '')
            setSelectedColor(project.color)
        }
    }, [project])


    useEffect(() => {
        if (!isVisible) {
            resetForm()
        }
    }, [isVisible])

    const handleSubmit = async () => {
        if (!name.trim()) return

        setIsLoading(true)
        try {
            const projectData = {
                name: name.trim(),
                description: description.trim(),
                color: selectedColor
            }

            let result: ProjectType

            if (isEditMode && project) {
                result = await updateProject.mutateAsync({
                    id: project.id,
                    data: projectData
                })
            } else {
                result = await createProject.mutateAsync(projectData)
            }

            onSuccess(result)
        } catch (error) {
            console.error('Failed to save project:', error)
        } finally {
            setIsLoading(false)
            router.push('/(tabs)/plans')
        }
    }

    const resetForm = () => {
        setName('')
        setDescription('')
        setSelectedColor('')
    }


    return (
        <Pressable onPress={hideKeyboard} className='flex-1'>
            <View variant='transparent' className="flex-1 justify-between">
                <View variant='transparent' className=" gap-y-4">
                    <Title>
                        {isEditMode
                            ? t('plans.projects.editProject.title')
                            : t('plans.projects.createProject.title')
                        }
                    </Title>

                    <TextInput
                        label={t('plans.projects.form.nameLabel')}
                        value={name}
                        onChangeText={setName}
                        placeholder={t('plans.projects.form.namePlaceholder')}
                    />

                    <TextInput
                        label={t('plans.projects.form.descriptionLabel')}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t('plans.projects.form.descriptionPlaceholder')}
                        multiline
                        numberOfLines={4}
                        voiceInput
                    />

                    <ColorPicker
                        selectedColor={selectedColor}
                        onSelectColor={setSelectedColor}
                        label={t('plans.projects.form.selectColor')}
                    />

                </View>
                {!isKeyboardVisible && (<View>
                    <Button
                        onPress={handleSubmit}
                        loading={isLoading}
                        disabled={!name.trim()}
                    >
                        {isEditMode
                            ? t('plans.projects.editProject.saveButton')
                            : t('plans.projects.createProject.createButton')
                        }
                    </Button>
                </View>
                )}

                {isKeyboardVisible && (
                    <View className=' flex-row justify-end' style={{ marginBottom: 16 }}>
                        <Button
                            onPress={handleSubmit}
                            disabled={!name.trim()}
                            variant='outline'
                            leftIcon='ChevronRight'
                            className='w-fit'
                        />
                    </View>
                )}

            </View >
        </Pressable>

    )
}