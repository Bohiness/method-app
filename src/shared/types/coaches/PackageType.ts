import { CurrencyCode } from '@shared/constants/currency';

export interface PackageType {
    id: number;
    expert?: number;
    coach?: number;
    name: string;
    appointmentEnabled: boolean;
    appointmentDuration: number;
    checkoutFlow: string;
    thankYouEnabled: boolean;
    thankYouURL?: string;
    status: string;
    purchaseLimitEnabled: boolean;
    maximumPurchaseCount?: number;
    expiryDateEnabled: boolean;
    expiryDate?: string;
    paymentType: string;
    oneTimePrice?: number;
    currency: CurrencyCode;
    paymentAmount?: number;
    numberOfPayments?: number;
    frequency?: string;
    monthlyPayment?: number;
    setupFee?: number;
    coverImage?: string;
    teaser: string;
    fullDescription: string;
    packageIncludes: string;
    protected: boolean;
}
