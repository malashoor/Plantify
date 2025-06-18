import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import NutrientCalculatorScreen from '../NutrientCalculatorScreen';
import { useNutrientCalculator } from '@hooks/useNutrientCalculator';
import { useAccessibility } from '@contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';
import {
  commonAccessibilityTests,
  mockAccessibilityInfo,
  mockAccessibilityHooks,
  createAccessibilityTestHelpers,
} from './accessibility-test-utils';

// Mock the hooks
jest.mock('@hooks/useNutrientCalculator');
jest.mock('@contexts/AccessibilityContext');
jest.mock('react-i18next');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Set up accessibility mocks
mockAccessibilityInfo();
mockAccessibilityHooks();

describe('NutrientCalculatorScreen Accessibility', () => {
  const mockT = jest.fn((key) => key);
  const mockI18n = { language: 'en' };
  const mockCalculator = {
    selectedCrop: null,
    selectedStage: null,
    selectedRecipe: null,
    waterVolume: 10,
    measurements: null,
    isLoading: false,
    error: null,
    voiceEnabled: true,
    units: 'metric',
    selectCrop: jest.fn(),
    selectStage: jest.fn(),
    selectRecipe: jest.fn(),
    setWaterVolume: jest.fn(),
    calculateNutrients: jest.fn(),
    saveNutrientSetup: jest.fn(),
    commonRecipes: [
      {
        id: 'recipe1',
        name: 'Test Recipe',
        nutrients: {
          nitrogen: 200,
          phosphorus: 50,
          potassium: 200,
          calcium: 150,
          magnesium: 50,
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT, i18n: mockI18n });
    (useNutrientCalculator as jest.Mock).mockReturnValue(mockCalculator);
  });

  // Run common accessibility tests
  commonAccessibilityTests.testBasicAccessibility(
    () => render(<NutrientCalculatorScreen />),
    mockT,
    {
      labels: [
        'nutrients.accessibility.screen_title',
        'nutrients.accessibility.main_content',
        'nutrients.accessibility.crop_section',
        'nutrients.accessibility.water_volume_input',
        'nutrients.accessibility.calculate_button',
      ],
      roles: {
        'nutrients.accessibility.water_volume_input': 'spinbutton',
        'nutrients.accessibility.calculate_button': 'button',
      },
      announcements: [
        'nutrients.accessibility.screen_loaded',
        'nutrients.accessibility.form_ready',
      ],
      focusOrder: [
        'nutrients.accessibility.crop_section',
        'nutrients.accessibility.stage_section',
        'nutrients.accessibility.recipe_section',
        'nutrients.accessibility.water_volume_input',
        'nutrients.accessibility.calculate_button',
      ],
    }
  );

  it('announces crop selection via screen reader', async () => {
    const { getAllByA11yRole } = render(<NutrientCalculatorScreen />);
    
    const cropButtons = getAllByA11yRole('radio');
    await act(async () => {
      fireEvent.press(cropButtons[0]);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('nutrients.accessibility.crop_selected')
    );
  });

  it('provides accessible numeric input for water volume', () => {
    const { getByA11yLabel } = render(<NutrientCalculatorScreen />);
    
    const input = getByA11yLabel('nutrients.accessibility.water_volume_input');
    expect(input).toBeTruthy();
    expect(input.props.accessibilityRole).toBe('spinbutton');
    expect(input.props.accessibilityHint).toBe('nutrients.accessibility.water_volume_hint');
  });

  it('announces calculation results to screen reader', async () => {
    const { getByA11yLabel } = render(<NutrientCalculatorScreen />);
    
    // Mock measurements result
    const mockResults = {
      nitrogen: 20,
      phosphorus: 5,
      potassium: 20,
      calcium: 15,
      magnesium: 5,
    };
    
    (useNutrientCalculator as jest.Mock).mockReturnValue({
      ...mockCalculator,
      measurements: mockResults,
    });

    const calculateButton = getByA11yLabel('nutrients.accessibility.calculate_button');
    await act(async () => {
      fireEvent.press(calculateButton);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('nutrients.accessibility.calculation_complete')
    );
  });

  it('provides accessible error states', async () => {
    (useNutrientCalculator as jest.Mock).mockReturnValue({
      ...mockCalculator,
      error: 'Test error message',
    });

    const { getByA11yLabel } = render(<NutrientCalculatorScreen />);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });
  });

  it('announces recipe selection with nutrient details', async () => {
    const { getAllByA11yRole } = render(<NutrientCalculatorScreen />);
    
    const recipeButtons = getAllByA11yRole('radio').filter(
      button => button.props.accessibilityHint === 'nutrients.accessibility.recipe_hint'
    );

    await act(async () => {
      fireEvent.press(recipeButtons[0]);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('nutrients.accessibility.recipe_selected')
    );
  });

  it('provides accessible measurement results with units', () => {
    (useNutrientCalculator as jest.Mock).mockReturnValue({
      ...mockCalculator,
      measurements: {
        nitrogen: 20,
        phosphorus: 5,
        potassium: 20,
        calcium: 15,
        magnesium: 5,
      },
    });

    const { getAllByA11yLabel } = render(<NutrientCalculatorScreen />);
    
    const results = getAllByA11yLabel(/nutrients\.accessibility\.measurement_/);
    expect(results).toHaveLength(5); // One for each nutrient
    
    results.forEach(result => {
      expect(result.props.accessibilityLabel).toMatch(/\d+\s*(ml|g)/);
    });
  });

  it('announces saved nutrient setups', async () => {
    const { getByA11yLabel } = render(<NutrientCalculatorScreen />);
    
    const saveButton = getByA11yLabel('nutrients.accessibility.save_button');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('nutrients.accessibility.setup_saved')
    );
  });
}); 