/**
 * Returns a promise that resolves after the specified delay in milliseconds
 * @param ms Delay in milliseconds
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutError Optional custom error to throw on timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: Error = new Error('Operation timed out')
): Promise<T> => {
  const timeoutPromise = delay(timeoutMs).then(() => {
    throw timeoutError;
  });

  return Promise.race([promise, timeoutPromise]);
};

/**
 * Retries a function with exponential backoff
 * @param fn Function to retry
 * @param maxAttempts Maximum number of attempts
 * @param baseDelay Base delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  baseDelay: number,
  maxDelay: number
): Promise<T> => {
  let attempt = 1;
  let lastError: Error;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        break;
      }

      const backoffDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

      await delay(backoffDelay);
      attempt++;
    }
  }

  throw lastError!;
};
