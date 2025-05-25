export type HydroponicErrorCode = 
  | 'INVALID_MEASUREMENT'
  | 'SYSTEM_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR';

export interface HydroponicErrorDetails {
  code: HydroponicErrorCode;
  message: string;
  field?: string;
  value?: unknown;
}

export class HydroponicError extends Error {
  public readonly code: HydroponicErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor({ code, message, ...details }: HydroponicErrorDetails) {
    super(message);
    this.name = 'HydroponicError';
    this.code = code;
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, HydroponicError.prototype);
  }

  public static isHydroponicError(error: unknown): error is HydroponicError {
    return error instanceof HydroponicError;
  }

  public static fromError(error: unknown): HydroponicError {
    if (HydroponicError.isHydroponicError(error)) {
      return error;
    }

    return new HydroponicError({
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
} 