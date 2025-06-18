import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Dashboard } from '../Dashboard';
import { PlantService } from '../../../services/PlantService';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../../services/PlantService');
jest.mock('@react-native-community/netinfo');

describe('Dashboard - Retry Functionality', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Mock NetInfo default state
    (NetInfo.addEventListener as jest.Mock).mockImplementation(callback => {
      callback({ isConnected: true });
      return () => {};
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('automatically retries with exponential backoff after timeout', async () => {
    let requestCount = 0;
    (PlantService.getPlants as jest.Mock).mockImplementation(() => {
      requestCount++;
      if (requestCount <= 2) {
        return Promise.reject(new Error('Request timed out'));
      }
      return Promise.resolve([{ id: 1, name: 'Test Plant' }]);
    });

    render(<Dashboard />);

    // Initial loading state
    expect(screen.getByLabelText('Loading plants')).toBeTruthy();

    // First failure
    await act(async () => {
      jest.runAllTimers();
    });

    // Verify retry message
    expect(screen.getByText('Request timed out')).toBeTruthy();
    expect(screen.getByText(/Retrying in \ds\.\.\./)).toBeTruthy();

    // First retry (after 2 seconds)
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Second retry (after 4 seconds)
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });

    // Success
    expect(screen.getByText('Test Plant')).toBeTruthy();
    expect(requestCount).toBe(3);
  });

  it('handles manual retry when clicked', async () => {
    let requestCount = 0;
    (PlantService.getPlants as jest.Mock).mockImplementation(() => {
      requestCount++;
      if (requestCount === 1) {
        return Promise.reject(new Error('Request timed out'));
      }
      return Promise.resolve([{ id: 1, name: 'Test Plant' }]);
    });

    render(<Dashboard />);

    // Wait for initial failure
    await act(async () => {
      jest.runAllTimers();
    });

    // Click retry
    const retryButton = screen.getByText(/Retry/);
    fireEvent.press(retryButton);

    // Success
    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Test Plant')).toBeTruthy();
    expect(requestCount).toBe(2);
  });

  it('cancels retry when cancel button is clicked', async () => {
    (PlantService.getPlants as jest.Mock).mockRejectedValue(new Error('Request timed out'));

    render(<Dashboard />);

    // Wait for initial failure
    await act(async () => {
      jest.runAllTimers();
    });

    // Verify retry is in progress
    expect(screen.getByText(/Retrying in/)).toBeTruthy();

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.press(cancelButton);

    // Verify retry was cancelled
    expect(screen.queryByText(/Retrying in/)).toBeNull();
    expect(screen.getByText('Retry (1/3)')).toBeTruthy();
  });

  it('handles offline to online transition', async () => {
    let isOnline = false;
    let netInfoCallback: (state: { isConnected: boolean }) => void;

    (NetInfo.addEventListener as jest.Mock).mockImplementation(callback => {
      netInfoCallback = callback;
      callback({ isConnected: isOnline });
      return () => {};
    });

    (PlantService.getPlants as jest.Mock).mockImplementation(() => {
      if (!isOnline) {
        return Promise.reject(new Error('Network request failed'));
      }
      return Promise.resolve([{ id: 1, name: 'Test Plant' }]);
    });

    render(<Dashboard />);

    // Initial offline error
    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByText('No internet connection')).toBeTruthy();

    // Simulate coming online
    isOnline = true;
    await act(async () => {
      netInfoCallback({ isConnected: true });
      jest.runAllTimers();
    });

    // Verify automatic retry on network restoration
    expect(screen.getByText('Test Plant')).toBeTruthy();
  });

  it('stops retrying after max attempts', async () => {
    let requestCount = 0;
    (PlantService.getPlants as jest.Mock).mockImplementation(() => {
      requestCount++;
      return Promise.reject(new Error('Request timed out'));
    });

    render(<Dashboard />);

    // Wait for all retries to complete
    await act(async () => {
      jest.runAllTimers(); // Initial attempt
      jest.advanceTimersByTime(2000); // First retry
      jest.advanceTimersByTime(4000); // Second retry
      jest.advanceTimersByTime(8000); // Would be third retry, but should not happen
    });

    expect(requestCount).toBe(3); // Initial + 2 retries
    expect(screen.getByText('Retry (3/3)')).toBeTruthy();
    expect(screen.queryByText(/Retrying in/)).toBeNull();
  });
});
