import * as Network from 'expo-network';

type NetworkListener = (isConnected: boolean) => void;

class NetworkManagerClass {
  private listeners: NetworkListener[] = [];
  private _isConnected: boolean = true;

  constructor() {
    this.checkConnection();
  }

  private async checkConnection() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this._isConnected = networkState.isConnected ?? true;
      this.notifyListeners();
    } catch (error) {
      console.error('Error checking network connection:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this._isConnected));
  }

  isConnected() {
    return this._isConnected;
  }

  addListener(listener: NetworkListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: NetworkListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
}

export const NetworkManager = new NetworkManagerClass(); 