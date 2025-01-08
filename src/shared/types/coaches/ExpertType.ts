import { CurrencyCode } from '@shared/constants/currency'
import { UserType } from '../user/UserType'

export type Gender = 'M' | 'F' | 'U';

// Интерфейс для модели ExpertModel
export interface ExpertType {
  id: number;
  user?: UserType;
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: Gender;
  date_of_birth?: string;
  citizenship: string;
  city: string;
  profile_photo: string;
  currency: CurrencyCode
  timezone: string;
  phone: string;
  country: string;
  active: boolean;
  agreement: boolean;
  isItcoach: boolean;
  coach?: number; // ID коуча
  isItPsychologist: boolean;
  psychologist?: number; // ID психолога
  isItSpecialist: boolean;
  Specialist?: number; // ID специалиста
  sessions_count: number;
  rating: number;
  reviews_count: number;
}
