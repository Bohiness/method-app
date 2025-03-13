// Типы для выбора пола

import { CurrencyCode } from '@shared/constants/currency';
import { ExpertType } from './ExpertType';

// Обновленный интерфейс для модели CoachModel
export interface CoachType {
    id: number;
    expert: ExpertType;
    approved: boolean;
    additional_weight: number;
    is_verification: boolean;
    verified: boolean;
    is_active: boolean;
    profile_photo?: string;
    video?: string;
    marital_status?: string;
    languages: string[];
    session_cost?: number;
    session_cost_currency?: CurrencyCode;
    industry?: string[];
    detailed_work_experience?: string;
    methodWork_about: string;
    coachType?: string[];
    coachQualification?: string[];
    directions?: string[];
    howWork_about: string;
    about_me: string;
    workFormat?: string[];
    years_of_coaching?: number;
    additionalComments?: string;
    your_style: string;
    accept_online_clients: boolean;
    personal_therapy_experience?: string;
    supervision_experience?: string;
    business_experience?: string;
    other_experience?: string;
    web_pages?: string;
    membership: boolean;
    MembershipDetails?: string;
    mentorship: boolean;
    consulting: boolean;
    training: boolean;
    education_data: Education[];
    coach_images_data: CoachImage[];
    coach_certificate_images_data: CoachCertificateImage[];
    average_response_time_hours?: number;
    new_bookings_last_48h?: number;
    is_popular?: boolean;
    popular_booking_count?: number;
    popular_updated_at?: string;
}

// Обновленные интерфейсы для связанных моделей
export interface CoachImage {
    id: number;
    coach: number;
    image?: string;
}

export interface CoachCertificateImage {
    id: number;
    coach: number;
    image?: string;
}

export interface EducationImage {
    id: number;
    education: number;
    image?: string;
}

export interface Education {
    id: number;
    coach: number;
    program?: string;
    institution?: string;
    higherEducation: boolean;
    startYear?: number;
    endYear?: number;
    certificate: number[];
    education_images: EducationImage[];
    certificate_images: CoachCertificateImage[];
}
