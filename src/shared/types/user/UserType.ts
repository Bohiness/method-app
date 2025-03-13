import { CurrencyCode } from '@shared/constants/currency';

// Типы для выбора пола
export type Gender = 'M' | 'F' | 'U';

export interface UserType {
    id: number;
    is_active: boolean;
    first_name: string;
    last_name: string;
    middle_name: string;
    username: string;
    gender: Gender;
    date_of_birth?: string;
    citizenship: string;
    agreement: boolean;
    account_type: string;
    country: string;
    currency: CurrencyCode;
    language: string;
    timezone: string;
    is_online: boolean;
    device_id: string;
    is_anonymous_user: boolean;
    last_online?: Date;
    confirmation_link: string;
    verification_code?: string;
    last_verification_sent?: Date;
    email: string;
    emailVerification: boolean;
    emailNews: boolean;
    emailActivity: boolean;
    phone: string;
    phoneVerification: boolean;
    profile_photo: string;
    is_expert: boolean;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    yookassa_payment_id: string;
    yookassa_subscription_id: string;
    tinkoff_customer_key: string;
    tinkoff_RebillId: string;
    telegram_chat_id: string;
    telegram_token: string;
    telegram_username: string;
    telegram_photo_url: string;
    is_telegram_linked: boolean;
    password?: string;
}
