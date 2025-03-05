// src/shared/lib/network/network.service.ts
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { storage } from '@shared/lib/storage/storage.service';

type NetworkListener = (isConnected: boolean) => void;

class NetworkService {
    private listeners: NetworkListener[] = [];
    private subscription: NetInfoSubscription | null = null;
    private isConnected: boolean = true;
    private readonly NETWORK_STATUS_KEY = 'network-status';

    constructor() {
        this.initNetworkMonitoring();
    }

    private async initNetworkMonitoring() {
        try {
            // Получаем последнее сохраненное состояние
            const savedStatus = await storage.get<boolean>(this.NETWORK_STATUS_KEY);
            if (savedStatus !== null) {
                this.isConnected = savedStatus;
            }

            // Устанавливаем слушатель
            this.subscription = NetInfo.addEventListener(this.handleNetworkChange);

            // Получаем текущее состояние
            const state = await NetInfo.fetch();
            this.handleNetworkChange(state);
        } catch (error) {
            console.error('Failed to initialize network monitoring:', error);
        }
    }

    private handleNetworkChange = async (state: NetInfoState) => {
        const isConnected = state.isConnected ?? true;

        if (this.isConnected !== isConnected) {
            this.isConnected = isConnected;

            // Сохраняем состояние
            await storage.set(this.NETWORK_STATUS_KEY, isConnected);

            // Уведомляем слушателей
            this.notifyListeners();

            // Логируем изменение состояния
            console.debug(`Network status changed: ${isConnected ? 'online' : 'offline'}`, {
                type: state.type,
                details: state.details,
            });
        }
    };

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.isConnected));
    }

    /**
     * Получить текущее состояние сети
     */
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    /**
     * Получить детальную информацию о соединении
     */
    async getConnectionInfo() {
        try {
            const state = await NetInfo.fetch();
            return {
                isConnected: state.isConnected,
                type: state.type,
                details: state.details,
                isInternetReachable: state.isInternetReachable,
            };
        } catch (error) {
            console.error('Failed to get connection info:', error);
            return null;
        }
    }

    /**
     * Добавить слушателя изменений состояния сети
     */
    addListener(listener: NetworkListener): () => void {
        this.listeners.push(listener);
        return () => this.removeListener(listener);
    }

    /**
     * Удалить слушателя
     */
    public removeListener(listener: NetworkListener) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Очистить все ресурсы
     */
    cleanup() {
        this.subscription?.();
        this.listeners = [];
    }
}

export const networkService = new NetworkService();
