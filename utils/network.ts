import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export class NetworkManager {
  private static instance: NetworkManager;
  private networkState: NetworkState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown'
  };

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.updateNetworkState(state);

      // Listen for network changes
      NetInfo.addEventListener(this.updateNetworkState.bind(this));
    } catch (error) {
      console.warn('Network initialization failed:', error);
    }
  }

  private updateNetworkState(state: any): void {
    this.networkState = {
      isConnected: Boolean(state.isConnected),
      isInternetReachable: Boolean(state.isInternetReachable),
      type: state.type || 'unknown'
    };
  }

  getNetworkState(): NetworkState {
    return this.networkState;
  }

  isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable;
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return Boolean(state.isConnected && state.isInternetReachable);
    } catch (error) {
      console.warn('Connectivity check failed:', error);
      return false;
    }
  }
}

// Retry mechanism for network requests
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('unauthorized') || message.includes('forbidden')) {
          throw error;
        }
      }

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Enhanced fetch with timeout and retry
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
} 