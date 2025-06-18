import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  jitterFactor: number;
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryState {
  attempt: number;
  nextRetryMs: number;
  error: Error | null;
  isRetrying: boolean;
  isOffline: boolean;
}

export type RetryCallback = (state: RetryState) => void;

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  jitterFactor: 0.1,
};

/**
 * Adds random jitter to avoid thundering herd problem
 */
const addJitter = (delay: number, jitterFactor: number): number => {
  const jitterRange = delay * jitterFactor;
  return delay + (Math.random() * 2 - 1) * jitterRange;
};

/**
 * Calculates the next retry delay with exponential backoff and jitter
 */
const calculateDelay = (
  attempt: number,
  { initialDelayMs, maxDelayMs, backoffFactor, jitterFactor }: RetryConfig
): number => {
  const exponentialDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
  const boundedDelay = Math.min(exponentialDelay, maxDelayMs);
  return addJitter(boundedDelay, jitterFactor);
};

/**
 * Checks if an error is retryable based on type and network state
 */
const isRetryableError = (error: Error): boolean => {
  return (
    error.name === 'TimeoutError' ||
    error.name === 'NetworkError' ||
    error.message.includes('network') ||
    error.message.includes('timeout')
  );
};

export class RetryController {
  private timeoutId: NodeJS.Timeout | null = null;
  private isOffline: boolean = false;
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor(
    private config: RetryConfig = DEFAULT_CONFIG,
    private onStateChange?: RetryCallback
  ) {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    if (Platform.OS !== 'web') {
      this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
        const wasOffline = this.isOffline;
        this.isOffline = !state.isConnected;

        // If we're coming back online and have a pending retry, trigger it immediately
        if (wasOffline && !this.isOffline && this.timeoutId) {
          this.triggerRetry();
        }
      });
    }
  }

  private updateState(state: Partial<RetryState>) {
    if (this.onStateChange) {
      this.onStateChange({
        attempt: 0,
        nextRetryMs: 0,
        error: null,
        isRetrying: false,
        isOffline: this.isOffline,
        ...state,
      });
    }
  }

  private triggerRetry() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.updateState({ isRetrying: true, nextRetryMs: 0 });
  }

  /**
   * Executes an async operation with retry logic
   */
  async execute<T>(operation: () => Promise<T>, customConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { ...DEFAULT_CONFIG, ...customConfig };
    let attempt = 1;

    while (attempt <= config.maxAttempts) {
      try {
        const result = await operation();
        this.updateState({ isRetrying: false });
        return result;
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        const shouldRetry =
          attempt < config.maxAttempts && (config.shouldRetry?.(error) ?? isRetryableError(error));

        if (!shouldRetry) {
          throw error;
        }

        const nextRetryMs = calculateDelay(attempt, config);
        this.updateState({
          attempt,
          error,
          nextRetryMs,
          isRetrying: true,
          isOffline: this.isOffline,
        });

        // If we're offline, don't start the timer yet
        if (!this.isOffline) {
          await new Promise<void>(resolve => {
            this.timeoutId = setTimeout(resolve, nextRetryMs);
          });
        }

        attempt++;
      }
    }

    throw new Error('Max retry attempts reached');
  }

  /**
   * Cancels any pending retry
   */
  cancel() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.updateState({ isRetrying: false });
  }

  /**
   * Forces an immediate retry attempt
   */
  retryNow() {
    this.triggerRetry();
  }

  /**
   * Cleanup network listeners
   */
  destroy() {
    this.cancel();
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }
}
