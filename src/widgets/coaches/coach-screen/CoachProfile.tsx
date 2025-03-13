
import { BookingButton } from '@features/coaches/coach-screen/BookingButton'
import { CoachBadges } from '@features/coaches/coach-screen/CoachBadges'
import { CoachEducation } from '@features/coaches/coach-screen/CoachEducation'
import { CoachInfo } from '@features/coaches/coach-screen/CoachInfo'
import { CoachStats } from '@features/coaches/coach-screen/CoachStats'
import { CoachVideo } from '@features/coaches/coach-screen/CoachVideo'
import { PhotosList } from '@features/coaches/coach-screen/PhotosList'
import { TruncatedHtmlParser } from '@shared/lib/utils/TruncatedHtmlParser'
import { CoachType } from '@shared/types/coaches/CoachType'
import { PackageType } from '@shared/types/coaches/PackageType'
import { Title } from '@shared/ui/text'
import { View } from '@shared/ui/view'
import { t } from 'i18next'
import { ScrollView } from 'react-native'

interface CoachProfileProps {
    coach: CoachType
    packages: PackageType[]
    isPackagesPending: boolean
    onBookingPress: () => void
}

export const CoachProfile = ({
    coach,
    packages,
    isPackagesPending,
    onBookingPress,
}: CoachProfileProps) => {
    return (
        <View className="flex-1" variant="default">
            <ScrollView>
                <CoachVideo
                    url={coach.video || ''}
                />
                <CoachInfo
                    image={coach.profile_photo || ''}
                    first_name={coach.expert.first_name || ''}
                    last_name={coach.expert.last_name || ''}
                    verified={coach.verified || false}
                    country={coach.expert.country || ''}
                    date_of_birth={coach.expert.date_of_birth || ''}
                    marital_status={coach.marital_status || ''}
                />

                <CoachStats
                    rating={5}
                    pricePerLesson={coach.session_cost || 0}
                    reviewsCount={coach.expert.reviews_count}
                    lessonsCount={coach.expert.sessions_count}
                    yearsOfExperience={coach.years_of_coaching || 0}
                />

                <View className="p-4 gap-y-6">
                    <View>
                        <Title>
                            {t('coaches.coach.aboutMe.title')}
                        </Title>

                        {coach.about_me && (
                            <TruncatedHtmlParser
                                html={coach.about_me}
                                maxLines={4}
                            />
                        )}

                        <CoachBadges
                            title={t('coaches.coach.languages.subtitle')}
                            items={coach.languages}
                            translationPrefix="coach.languages"
                            variant="outline"
                            className="mt-4"
                        />

                        {coach.coach_images_data?.length > 0 && (
                            <PhotosList
                                photos={coach.coach_images_data}
                                gallery={'gallery1'}
                                title={t('coaches.coach.photos')}
                                className="mt-4"
                            />
                        )}
                    </View>

                    <View>
                        <Title>
                            {t('coaches.coach.whatIWorkWith.title')}
                        </Title>

                        {coach.howWork_about && (
                            <TruncatedHtmlParser
                                html={coach.howWork_about}
                                maxLines={4}
                            />
                        )}

                        <CoachBadges
                            title={t('coaches.coach.coachTypes.subtitle')}
                            items={coach.coachType}
                            translationPrefix="coach.coachTypes"
                            variant="outline"
                            className="mt-4"
                        />

                        <CoachBadges
                            title={t('coaches.coach.industries.subtitle')}
                            items={coach.industry}
                            translationPrefix="coach.industries"
                            variant="outline"
                            className="mt-4"
                        />


                    </View>


                    <View>
                        <Title>
                            {t('coaches.coach.workMethods.title')}
                        </Title>

                        {coach.methodWork_about && (
                            <TruncatedHtmlParser
                                html={coach.methodWork_about}
                                maxLines={4}
                            />
                        )}

                        <CoachBadges
                            title={t('coaches.coach.directions.subtitle')}
                            items={coach.directions}
                            translationPrefix="coach.directions"
                            variant="outline"
                            className="mt-4"
                        />

                        <CoachBadges
                            title={t('coaches.coach.icfCertificationLevel.subtitle')}
                            items={coach.coachQualification}
                            translationPrefix="coach.qualifications"
                            variant="outline"
                            className="mt-4"
                        />

                    </View>
                </View>


                <CoachEducation education_data={coach.education_data} />

                <View className="p-4 gap-y-6">
                    {coach.coach_certificate_images_data?.length > 0 && (
                        <PhotosList
                            photos={coach.coach_certificate_images_data}
                            gallery={'gallery1'}
                            title={t('coaches.coach.additionalPhotos')}
                            className="mt-4"
                        />
                    )}
                </View>


            </ScrollView>

            <BookingButton
                price={coach.session_cost || 0}
                onPress={onBookingPress}
                packages={packages}
                isPackagesPending={isPackagesPending}
            />
        </View>
    )
}