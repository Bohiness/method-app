// src/shared/lib/logger/transports/logstash.transport.ts

import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { LogData, LogLevel } from '../logger.types'
import { BaseTransport } from './base.transport'

export interface LogstashConfig {
  host: string;
  port: number;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  flushInterval: number;
  enabled: boolean;
  levels: LogLevel[];
}

export class LogstashTransport extends BaseTransport {
  protected config: LogstashConfig;
  private queue: LogData[] = [];
  private timer?: NodeJS.Timeout;
  private retryCount = 0;

  constructor(config: Partial<LogstashConfig> = {}) {
    super();
    this.config = {
      host: Constants.expoConfig?.extra?.logstashHost || 'localhost',
      port: Constants.expoConfig?.extra?.logstashPort || 5000,
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 100,
      flushInterval: 5000,
      enabled: true,
      levels: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'COMPONENT', 'API', 'HTTP', 'CUSTOM', 'TABLE', 'JSON', 'GROUP'],
      ...config
    };

    this.startTimer();
  }

  private startTimer() {
    this.timer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  private async send(logs: LogData[]): Promise<void> {
    try {
      const response = await fetch(`http://${this.config.host}:${this.config.port}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          meta: {
            app: Constants.expoConfig?.name,
            version: Constants.expoVersion,
            platform: Platform.OS,
            environment: __DEV__ ? 'development' : 'production'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Logstash error: ${response.statusText}`);
      }

      this.retryCount = 0;
    } catch (error) {
      this.retryCount++;
      
      if (this.retryCount <= this.config.maxRetries) {
        setTimeout(() => this.flush(), this.config.retryDelay);
      } else {
        console.error('LogstashTransport: Max retries exceeded', error);
        this.retryCount = 0;
      }
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.config.batchSize);
    await this.send(batch);
  }

  async write(data: LogData): Promise<void> {
    this.queue.push(data);
    
    if (this.queue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
