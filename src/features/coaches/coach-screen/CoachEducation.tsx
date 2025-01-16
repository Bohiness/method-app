// src/widgets/coach/CoachProfile/CoachEducation/index.tsx
import { CoachType } from '@shared/types/coaches/CoachType'
import { Avatar } from '@shared/ui/avatar'
import { Text, Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
    education_data?: CoachType['education_data']
}

export const CoachEducation: React.FC<Props> = ({ education_data = [] }) => {
    const { t } = useTranslation()

    // Защита от undefined
    if (!Array.isArray(education_data)) {
        console.warn('CoachEducation: education_data is not an array:', education_data)
        return null
    }

    // Подсчитываем количество высшего и дополнительного образования
    const educationCounts = useMemo(() => {
        return education_data.reduce((acc, edu) => ({
            higher: acc.higher + (edu.higherEducation ? 1 : 0),
            additional: acc.additional + (edu.higherEducation ? 0 : 1)
        }), { higher: 0, additional: 0 })
    }, [education_data])

    // Если нет данных, не отображаем компонент
    if (education_data.length === 0) {
        console.log('CoachEducation: No education data available')
        return null
    }

    return (
        <View className="p-4">
            {/* Заголовок с количеством */}
            <View className="mb-4">
                <Title>
                    {t('coaches.coach.education.title')}
                </Title>
                <View className="flex-row mt-1">
                    {educationCounts.higher > 0 && (
                        <Text
                            size="sm"
                            variant="secondary"
                            className="mr-3"
                        >
                            {educationCounts.higher} {t('coaches.coach.education.higher')}
                        </Text>
                    )}
                    {educationCounts.additional > 0 && (
                        <Text
                            size="sm"
                            variant="secondary"
                        >
                            {educationCounts.additional} {t('coaches.coach.education.additional')}
                        </Text>
                    )}
                </View>
            </View>

            {/* Список образования */}
            {education_data.map((education, index) => (
                <View
                    key={education.id || index} // Используем id если доступен
                    className="flex-row mb-4"
                >

                    {/* Информация */}
                    <View className="flex-1">
                        <Text weight="medium">
                            {education.program || t('coaches.coach.education.noProgram')}
                        </Text>

                        {education.institution && (
                            <Text
                                size="sm"
                                variant="secondary"
                                className="mt-1"
                            >
                                {education.institution}
                                {education.higherEducation && (
                                    <Text
                                        size="sm"
                                        variant="secondary"
                                    >
                                        {`, ${t('coaches.coach.education.higher')}`}
                                    </Text>
                                )}
                            </Text>
                        )}

                        {(education.startYear || education.endYear) && (
                            <Text
                                size="sm"
                                variant="secondary"
                                className="mt-1"
                            >
                                {education.startYear}
                                {education.endYear && education.endYear !== education.startYear &&
                                    ` – ${education.endYear}`
                                }
                            </Text>
                        )}
                    </View>

                    {/* Сертификаты */}
                    {Array.isArray(education.certificate_images) &&
                        education.certificate_images.length > 0 &&
                        education.certificate_images[0]?.image && (
                            <View className="w-20 mr-3">
                                <Avatar
                                    source={{ uri: education.certificate_images[0].image }}
                                    size="2xl"
                                    shape="square"
                                    className="rounded-lg"
                                />
                            </View>
                        )}
                </View>
            ))}
        </View>
    )
}