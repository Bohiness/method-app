import { UserType } from './UserType';

export interface AuthTokensType {
    access: string;
    refresh: string;
    expiresAt?: number;
}

export interface CheckAuthResponse {
    csrfToken: string;
    is_authenticated: boolean;
    userData: UserType;
}
