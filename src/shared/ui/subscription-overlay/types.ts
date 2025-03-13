import { SubscriptionPlan } from '@shared/types/subscription/SubscriptionType';
import { ReactNode } from 'react';

export interface SubscriptionOverlayProps {
    children: ReactNode;
    plan: SubscriptionPlan;
    text?: string;
}
