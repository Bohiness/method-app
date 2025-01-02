import { apiClient } from "@shared/config/api-client"
import { MoodCheckin } from "@shared/types/diary/mood/MoodType"
import { storage } from "../storage/storage.service"

// src/shared/lib/queue/moodSyncQueue.ts
class MoodSyncQueue {
  private readonly OFFLINE_QUEUE_KEY = 'mood-offline-queue';
  
  async addToQueue(checkin: Omit<MoodCheckin, 'id' | 'created_at'>) {
    const queue = await this.getQueue();
    const newCheckin = {
      ...checkin,
      id: Date.now(),
      created_at: new Date().toISOString(),
      synced: false
    };
    
    await storage.set(this.OFFLINE_QUEUE_KEY, [...queue, newCheckin]);
    return newCheckin;
  }

  async syncWithServer() {
    const queue = await this.getQueue();
    const unsynced = queue.filter(item => !item.synced);
    
    for (const checkin of unsynced) {
      try {
        await apiClient.post('/api/mood-checkins/', checkin);
        await this.markAsSynced(checkin.id);
      } catch (error) {
        console.error('Failed to sync checkin:', error);
      }
    }
  }

  private async getQueue(): Promise<Array<MoodCheckin & { synced: boolean }>> {
    return await storage.get<Array<MoodCheckin & { synced: boolean }>>(this.OFFLINE_QUEUE_KEY) || [];
  }

  private async markAsSynced(id: number) {
    const queue = await this.getQueue();
    const updated = queue.map(item => 
      item.id === id ? { ...item, synced: true } : item
    );
    await storage.set(this.OFFLINE_QUEUE_KEY, updated);
  }
}

export const moodSyncQueue = new MoodSyncQueue();