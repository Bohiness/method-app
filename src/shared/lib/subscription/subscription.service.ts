// src/shared/lib/subscription/subscription.service.ts
import { apiClient } from '@shared/config/api-client'
import { storage } from '@shared/lib/storage/storage.service'
import { SubscriptionPlan, SubscriptionStatus } from '@shared/types/subscription/SubscriptionType'

class SubscriptionService {
    private readonly SUBSCRIPTION_KEY = 'user-subscription';

    async getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
        try {
            const response = await apiClient.get<SubscriptionStatus>('/api/subscription/status');
            await storage.set(this.SUBSCRIPTION_KEY, response);
            return response;
        } catch (error) {
            console.error('Failed to get subscription status:', error);
            return storage.get<SubscriptionStatus>(this.SUBSCRIPTION_KEY);
        }
    }

    async getAvailablePlans(): Promise<SubscriptionPlan[]> {
        try {
            return await apiClient.get<SubscriptionPlan[]>('/api/subscription/plans');
        } catch (error) {
            console.error('Failed to get subscription plans:', error);
            throw error;
        }
    }

    async subscribe(planId: string): Promise<SubscriptionStatus> {
        try {
            const response = await apiClient.post<SubscriptionStatus>('/api/subscription/subscribe', {
                planId
            });
            await storage.set(this.SUBSCRIPTION_KEY, response);
            return response;
        } catch (error) {
            console.error('Failed to subscribe:', error);
            throw error;
        }
    }

    async cancelSubscription(): Promise<void> {
        try {
            await apiClient.post('/api/subscription/cancel');
            const currentStatus = await storage.get<SubscriptionStatus>(this.SUBSCRIPTION_KEY);
            if (currentStatus) {
                await storage.set(this.SUBSCRIPTION_KEY, {
                    ...currentStatus,
                    cancelAtPeriodEnd: true
                });
            }
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            throw error;
        }
    }

    async restoreSubscription(): Promise<void> {
        try {
            await apiClient.post('/api/subscription/restore');
            const currentStatus = await storage.get<SubscriptionStatus>(this.SUBSCRIPTION_KEY);
            if (currentStatus) {
                await storage.set(this.SUBSCRIPTION_KEY, {
                    ...currentStatus,
                    cancelAtPeriodEnd: false
                });
            }
        } catch (error) {
            console.error('Failed to restore subscription:', error);
            throw error;
        }
    }
}

export const subscriptionService = new SubscriptionService();
