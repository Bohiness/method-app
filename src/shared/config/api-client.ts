// src/shared/api/base/api-client.ts
import { storage } from '@shared/lib/storage/storage.service'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do'

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const session = await storage.get('user-session', true)
    return {
      'Content-Type': 'application/json',
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()