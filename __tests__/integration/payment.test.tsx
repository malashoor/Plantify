import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as RNIap from 'react-native-iap';
import { PaymentScreen } from '../../src/screens/PaymentScreen';
import { paymentProcessor } from '../../src/services/payment/processor';
import type { PaymentProduct } from '../../src/types/payment';

jest.mock('react-native-iap');

describe('Payment Integration Tests', () => {
  const mockProducts: PaymentProduct[] = [
    {
      productId: 'test_product',
      title: 'Test Product',
      description: 'Test product description',
      price: '9.99',
      currency: 'USD',
      localizedPrice: '$9.99',
      type: 'inapp',
    },
    {
      productId: 'test_subscription',
      title: 'Test Subscription',
      description: 'Test subscription description',
      price: '4.99',
      currency: 'USD',
      localizedPrice: '$4.99',
      type: 'subscription',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (RNIap.initConnection as jest.Mock).mockResolvedValue(undefined);
    (RNIap.getProducts as jest.Mock).mockResolvedValue(mockProducts);
    (RNIap.requestPurchase as jest.Mock).mockResolvedValue({
      productId: 'test_product',
      transactionId: 'test_transaction',
      transactionDate: new Date().toISOString(),
      receipt: 'test_receipt',
    });
  });

  it('should initialize payment system and load products', async () => {
    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(RNIap.initConnection).toHaveBeenCalled();
      expect(RNIap.getProducts).toHaveBeenCalled();
      expect(getByText('Test Product')).toBeTruthy();
      expect(getByText('Test Subscription')).toBeTruthy();
    });
  });

  it('should handle successful purchase', async () => {
    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Test Product')).toBeTruthy();
    });

    fireEvent.press(getByText('Purchase'));

    await waitFor(() => {
      expect(RNIap.requestPurchase).toHaveBeenCalledWith({
        sku: 'test_product',
      });
      expect(getByText('Purchase successful!')).toBeTruthy();
    });
  });

  it('should handle purchase failure', async () => {
    (RNIap.requestPurchase as jest.Mock).mockRejectedValue(new Error('Purchase failed'));

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Test Product')).toBeTruthy();
    });

    fireEvent.press(getByText('Purchase'));

    await waitFor(() => {
      expect(getByText('Purchase failed')).toBeTruthy();
    });
  });

  it('should validate receipt with backend', async () => {
    const mockValidateReceipt = jest.spyOn(paymentProcessor, 'validateReceipt');
    mockValidateReceipt.mockResolvedValue(true);

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Test Product')).toBeTruthy();
    });

    fireEvent.press(getByText('Purchase'));

    await waitFor(() => {
      expect(mockValidateReceipt).toHaveBeenCalledWith('test_receipt');
      expect(getByText('Purchase successful!')).toBeTruthy();
    });
  });

  it('should handle receipt validation failure', async () => {
    const mockValidateReceipt = jest.spyOn(paymentProcessor, 'validateReceipt');
    mockValidateReceipt.mockRejectedValue(new Error('Invalid receipt'));

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Test Product')).toBeTruthy();
    });

    fireEvent.press(getByText('Purchase'));

    await waitFor(() => {
      expect(mockValidateReceipt).toHaveBeenCalledWith('test_receipt');
      expect(getByText('Purchase validation failed')).toBeTruthy();
    });
  });
});
