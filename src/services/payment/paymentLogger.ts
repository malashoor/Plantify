import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';
import { PaymentError, PaymentMetadata } from '../../types/payment';

interface PaymentFailureLog {
  userId: string;
  platform: typeof Platform.OS;
  error: PaymentError;
  metadata: PaymentMetadata;
  timestamp?: string;
}

export async function logPaymentFailure(log: PaymentFailureLog): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/log/payment-failure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...log,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Don't throw on logging errors, just console.error
    console.error('Failed to log payment failure:', error);
  }
}

export async function getPaymentFailureLogs(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<PaymentFailureLog[]> {
  try {
    const queryParams = new URLSearchParams({
      userId,
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
    });

    const response = await fetch(`${API_BASE_URL}/log/payment-failures?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment failure logs');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get payment failure logs:', error);
    return [];
  }
}
