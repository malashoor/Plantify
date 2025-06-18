import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import LightingCalculatorScreen from '../LightingCalculatorScreen';
import { useLightingCalculator } from '@hooks/useLightingCalculator';
import { useAccessibility } from '@contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';
import {
  commonAccessibilityTests,
  mockAccessibilityInfo,
  mockAccessibilityHooks,
  createAccessibilityTestHelpers,
} from './accessibility-test-utils';

// Mock the hooks
jest.mock('@hooks/useLightingCalculator');
jest.mock('@contexts/AccessibilityContext');
jest.mock('react-i18next');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Set up accessibility mocks
mockAccessibilityInfo();
mockAccessibilityHooks();

describe('LightingCalculatorScreen Accessibility', () => {
  const mockT = jest.fn(key => key);
  const mockI18n = { language: 'en' };
  const mockCalculator = {
    selectedCrop: null,
    selectedStage: null,
    selectedLED: null,
    distance: 100,
    photoperiod: null,
    calculations: null,
    isLoading: false,
    error: null,
    voiceEnabled: true,
    units: 'metric',
    selectCrop: jest.fn(),
    selectStage: jest.fn(),
    selectLED: jest.fn(),
    setDistance: jest.fn(),
    setPhotoperiod: jest.fn(),
    calculateLighting: jest.fn(),
    saveLightingSetup: jest.fn(),
    commonPhotoperiods: [
      { lightHours: 18, darkHours: 6 },
      { lightHours: 12, darkHours: 12 },
    ],
    commonLEDs: [
      {
        id: 'led1',
        name: 'Test LED',
        wattage: 100,
        ppfd: 1000,
        coverage: 4,
        spectrum: {
          blue: 30,
          red: 60,
          white: 10,
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT, i18n: mockI18n });
    (useLightingCalculator as jest.Mock).mockReturnValue(mockCalculator);
  });

  // Run common accessibility tests
  commonAccessibilityTests.testBasicAccessibility(
    () => render(<LightingCalculatorScreen />),
    mockT,
    {
      labels: [
        'lighting.accessibility.screen_title',
        'lighting.accessibility.main_content',
        'lighting.accessibility.crop_section',
        'lighting.accessibility.distance_slider',
        'lighting.accessibility.calculate_button',
      ],
      roles: {
        'lighting.accessibility.distance_slider': 'adjustable',
        'lighting.accessibility.calculate_button': 'button',
      },
      announcements: ['lighting.accessibility.screen_loaded', 'lighting.accessibility.form_ready'],
      focusOrder: [
        'lighting.accessibility.crop_section',
        'lighting.accessibility.stage_section',
        'lighting.accessibility.led_section',
        'lighting.accessibility.distance_slider',
        'lighting.accessibility.photoperiod_section',
        'lighting.accessibility.calculate_button',
      ],
    }
  );

  it('announces crop selection via screen reader', async () => {
    const { getAllByA11yRole } = render(<LightingCalculatorScreen />);

    const cropButtons = getAllByA11yRole('radio');
    await act(async () => {
      fireEvent.press(cropButtons[0]);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('lighting.accessibility.crop_selected')
    );
  });

  it('provides accessible slider controls for distance adjustment', () => {
    const { getByA11yLabel } = render(<LightingCalculatorScreen />);

    const slider = getByA11yLabel('lighting.accessibility.distance_slider');
    expect(slider).toBeTruthy();
    expect(slider.props.accessibilityRole).toBe('adjustable');
    expect(slider.props.accessibilityHint).toBe('lighting.accessibility.distance_hint');
  });

  it('announces calculation results to screen reader', async () => {
    const { getByA11yLabel } = render(<LightingCalculatorScreen />);

    // Mock calculations result
    const mockResults = {
      dli: 40.5,
      powerConsumption: 2.4,
      estimatedCost: 0.72,
    };

    (useLightingCalculator as jest.Mock).mockReturnValue({
      ...mockCalculator,
      calculations: mockResults,
    });

    const calculateButton = getByA11yLabel('lighting.accessibility.calculate_button');
    await act(async () => {
      fireEvent.press(calculateButton);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('lighting.accessibility.calculation_complete')
    );
  });

  it('provides accessible error states', async () => {
    (useLightingCalculator as jest.Mock).mockReturnValue({
      ...mockCalculator,
      error: 'Test error message',
    });

    const { getByA11yLabel } = render(<LightingCalculatorScreen />);

    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });
  });

  it('announces photoperiod changes', async () => {
    const { getAllByA11yRole } = render(<LightingCalculatorScreen />);

    const photoperiodButtons = getAllByA11yRole('radio').filter(
      button => button.props.accessibilityHint === 'lighting.accessibility.photoperiod_hint'
    );

    await act(async () => {
      fireEvent.press(photoperiodButtons[0]);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('lighting.accessibility.photoperiod_selected')
    );
  });

  it('provides accessible LED selection with detailed information', () => {
    const { getAllByA11yRole } = render(<LightingCalculatorScreen />);

    const ledButtons = getAllByA11yRole('radio').filter(button =>
      button.props.accessibilityLabel?.includes('LED light')
    );

    expect(ledButtons[0].props.accessibilityLabel).toContain('Test LED');
    expect(ledButtons[0].props.accessibilityLabel).toContain('100 watts');
    expect(ledButtons[0].props.accessibilityLabel).toContain('1000');
    expect(ledButtons[0].props.accessibilityLabel).toContain('4');
  });
});
