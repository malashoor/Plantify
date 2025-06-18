import { act } from '@testing-library/react-native';

// Default timeout duration used in the app
export const NETWORK_TIMEOUT = 30000;

/**
 * Simulates a network timeout by creating a promise that never resolves
 * and advancing timers past the timeout threshold
 */
export const simulateNetworkTimeout = async () => {
  // Create a promise that never resolves
  const pendingPromise = new Promise(() => {});
  
  // Advance timers past the timeout threshold
  await act(async () => {
    jest.advanceTimersByTime(NETWORK_TIMEOUT + 1000);
  });

  return pendingPromise;
};

/**
 * Creates a controlled promise that can be resolved/rejected on demand
 * with optional timeout simulation
 */
export const createNetworkPromise = <T>() => {
  let resolver: (value: T) => void;
  let rejecter: (error: Error) => void;
  
  const promise = new Promise<T>((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });

  return {
    promise,
    resolve: (value: T) => resolver(value),
    reject: (error: Error) => rejecter(error),
    timeout: () => simulateNetworkTimeout(),
  };
};

/**
 * Simulates an offline state with a specific error
 */
export const simulateOffline = () => {
  return Promise.reject(new Error('Network request failed'));
};

/**
 * Creates a mock service that can simulate various network conditions
 */
export const createMockNetworkService = () => {
  let isOffline = false;
  let shouldTimeout = false;
  let currentPromise: ReturnType<typeof createNetworkPromise> | null = null;

  return {
    setOffline: (offline: boolean) => {
      isOffline = offline;
    },
    setTimeout: (timeout: boolean) => {
      shouldTimeout = timeout;
    },
    createRequest: <T>(successValue: T) => {
      if (isOffline) {
        return simulateOffline();
      }

      if (shouldTimeout) {
        return simulateNetworkTimeout();
      }

      currentPromise = createNetworkPromise<T>();
      return currentPromise.promise;
    },
    resolveLastRequest: <T>(value: T) => {
      if (currentPromise) {
        currentPromise.resolve(value);
      }
    },
    rejectLastRequest: (error: Error) => {
      if (currentPromise) {
        currentPromise.reject(error);
      }
    },
  };
}; 