import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../../src/services/analytics/AnalyticsService';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { SettingsScreen } from '../../src/screens/SettingsScreen';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('mixpanel-react-native');

describe('Analytics Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should initialize analytics with correct opt-out state', async () => {
    await analyticsService.init();
    expect(analyticsService.isEnabled()).toBe(true);

    await AsyncStorage.setItem('analytics_opt_out', 'true');
    await analyticsService.init();
    expect(analyticsService.isEnabled()).toBe(false);
  });

  it('should track events when enabled', async () => {
    await analyticsService.init();
    const trackSpy = jest.spyOn(analyticsService, 'track');

    await analyticsService.track('test_event', { prop: 'value' });
    expect(trackSpy).toHaveBeenCalledWith('test_event', { prop: 'value' });
  });

  it('should not track events when disabled', async () => {
    await analyticsService.setOptOut(true);
    const trackSpy = jest.spyOn(analyticsService, 'track');

    await analyticsService.track('test_event', { prop: 'value' });
    expect(trackSpy).not.toHaveBeenCalled();
  });

  it('should persist opt-out state', async () => {
    await analyticsService.setOptOut(true);
    expect(await AsyncStorage.getItem('analytics_opt_out')).toBe('true');

    await analyticsService.setOptOut(false);
    expect(await AsyncStorage.getItem('analytics_opt_out')).toBe('false');
  });

  describe('SettingsScreen Integration', () => {
    it('should toggle analytics when switch is pressed', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      const toggle = getByTestId('analytics-toggle');

      expect(analyticsService.isEnabled()).toBe(true);
      fireEvent.press(toggle);

      await waitFor(() => {
        expect(analyticsService.isEnabled()).toBe(false);
        expect(AsyncStorage.getItem('analytics_opt_out')).resolves.toBe('true');
      });
    });

    it('should reflect current analytics state', async () => {
      await analyticsService.setOptOut(true);
      const { getByTestId } = render(<SettingsScreen />);
      
      expect(getByTestId('analytics-toggle').props.value).toBe(false);
    });
  });
}); 