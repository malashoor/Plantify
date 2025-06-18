import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Dashboard } from '../Dashboard';
import { createMockNetworkService } from './utils/networkUtils';
import { PlantService } from '../../../services/PlantService';

jest.mock('../../../services/PlantService');
jest.useFakeTimers();

describe('Dashboard - Network Timeout Handling', () => {
  const mockNetworkService = createMockNetworkService();
  
  beforeEach(() => {
    // Reset mocks and timers before each test
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Mock the PlantService methods
    (PlantService.getPlants as jest.Mock).mockImplementation(() => 
      mockNetworkService.createRequest([])
    );
  });

  it('shows timeout message after network request exceeds timeout limit', async () => {
    mockNetworkService.setTimeout(true);
    
    render(<Dashboard />);
    
    // Verify loading state is shown initially
    expect(screen.getByLabelText('Loading plants')).toBeTruthy();
    
    // Wait for timeout
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Verify timeout message is shown
    expect(screen.getByText('Failed to load plants')).toBeTruthy();
    expect(screen.getByText('Tap to retry')).toBeTruthy();
    
    // Verify accessibility announcement
    expect(screen.getByRole('alert')).toHaveAccessibilityLabel(
      'Loading timed out. Tap to retry loading plants.'
    );
  });

  it('handles retry attempt successfully', async () => {
    mockNetworkService.setTimeout(true);
    
    render(<Dashboard />);
    
    // Wait for initial timeout
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Reset timeout flag and prepare success response
    mockNetworkService.setTimeout(false);
    const mockPlants = [{ id: 1, name: 'Test Plant' }];
    
    // Trigger retry
    const retryButton = screen.getByText('Tap to retry');
    fireEvent.press(retryButton);
    
    // Verify loading state is shown again
    expect(screen.getByLabelText('Loading plants')).toBeTruthy();
    
    // Resolve the request
    await act(async () => {
      mockNetworkService.resolveLastRequest(mockPlants);
    });
    
    // Verify plants are displayed
    expect(screen.getByText('Test Plant')).toBeTruthy();
  });

  it('handles multiple consecutive timeouts', async () => {
    mockNetworkService.setTimeout(true);
    
    render(<Dashboard />);
    
    // First timeout
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Verify first timeout message
    expect(screen.getByText('Failed to load plants')).toBeTruthy();
    
    // Trigger retry (still with timeout enabled)
    fireEvent.press(screen.getByText('Tap to retry'));
    
    // Second timeout
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Verify timeout message is still shown
    expect(screen.getByText('Failed to load plants')).toBeTruthy();
    expect(screen.getByText('Tap to retry')).toBeTruthy();
  });

  it('handles offline state during retry', async () => {
    mockNetworkService.setTimeout(true);
    
    render(<Dashboard />);
    
    // Wait for initial timeout
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Set to offline and trigger retry
    mockNetworkService.setTimeout(false);
    mockNetworkService.setOffline(true);
    
    fireEvent.press(screen.getByText('Tap to retry'));
    
    // Verify offline error message
    expect(screen.getByText('No internet connection')).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveAccessibilityLabel(
      'No internet connection. Please check your connection and try again.'
    );
  });

  it('handles partial data loading with timeout', async () => {
    // Mock successful categories load but timeout on plants
    const mockCategories = ['Indoor', 'Outdoor'];
    (PlantService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
    (PlantService.getPlants as jest.Mock).mockImplementation(() => 
      mockNetworkService.createRequest([])
    );
    mockNetworkService.setTimeout(true);
    
    render(<Dashboard />);
    
    // Verify categories are loaded
    expect(screen.getByText('Indoor')).toBeTruthy();
    expect(screen.getByText('Outdoor')).toBeTruthy();
    
    // Wait for plants request to timeout
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Verify timeout message for plants only
    expect(screen.getByText('Failed to load plants')).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveAccessibilityLabel(
      'Loading timed out. Tap to retry loading plants.'
    );
  });
}); 