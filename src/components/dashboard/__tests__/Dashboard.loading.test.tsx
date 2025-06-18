import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import { Dashboard } from '../Dashboard';
import { PlantService } from '../../../services/PlantService';
import { WeatherService } from '../../../services/WeatherService';
import { AccessibilityInfo } from 'react-native';

// Mock dependencies
jest.mock('../../../services/PlantService');
jest.mock('../../../services/WeatherService');
jest.mock('react-native/Libraries/Utilities/AccessibilityInfo', () => ({
  isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  announceForAccessibility: jest.fn(),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Dashboard Loading States', () => {
  const mockTheme = {
    dark: false,
    colors: {
      primary: '#4CAF50',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      disabled: '#9E9E9E',
      placeholder: '#BDBDBD',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
  };

  const renderWithTheme = (ui: React.ReactElement, isDark = false) => {
    const theme = {
      ...mockTheme,
      dark: isDark,
      colors: isDark
        ? {
            ...mockTheme.colors,
            background: '#121212',
            surface: '#1E1E1E',
            text: '#FFFFFF',
          }
        : mockTheme.colors,
    };

    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('renders skeleton placeholders during initial load', async () => {
      // Mock delayed plant loading
      let resolvePlants: (value: any) => void;
      const plantsPromise = new Promise(resolve => {
        resolvePlants = resolve;
      });
      (PlantService.getPlants as jest.Mock).mockImplementation(() => plantsPromise);

      const { toJSON } = renderWithTheme(<Dashboard />);

      // Capture initial skeleton state
      expect(toJSON()).toMatchSnapshot('initial-skeleton-light');

      // Complete loading
      await act(async () => {
        resolvePlants([]);
      });
    });

    it('renders dark mode skeleton placeholders', async () => {
      let resolvePlants: (value: any) => void;
      const plantsPromise = new Promise(resolve => {
        resolvePlants = resolve;
      });
      (PlantService.getPlants as jest.Mock).mockImplementation(() => plantsPromise);

      const { toJSON } = renderWithTheme(<Dashboard />, true);

      // Capture dark mode skeleton state
      expect(toJSON()).toMatchSnapshot('initial-skeleton-dark');

      await act(async () => {
        resolvePlants([]);
      });
    });

    it('shows loading state with reduced motion', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );

      let resolvePlants: (value: any) => void;
      const plantsPromise = new Promise(resolve => {
        resolvePlants = resolve;
      });
      (PlantService.getPlants as jest.Mock).mockImplementation(() => plantsPromise);

      const { toJSON } = renderWithTheme(<Dashboard />);

      // Capture reduced motion loading state
      expect(toJSON()).toMatchSnapshot('loading-reduced-motion');

      await act(async () => {
        resolvePlants([]);
      });
    });
  });

  describe('Filter and Sort Transitions', () => {
    it('shows loading state during filter change', async () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard />);

      // Setup delayed filter response
      let resolveFilteredPlants: (value: any) => void;
      const filteredPlantsPromise = new Promise(resolve => {
        resolveFilteredPlants = resolve;
      });
      (PlantService.getPlants as jest.Mock)
        .mockResolvedValueOnce([]) // Initial load
        .mockImplementationOnce(() => filteredPlantsPromise); // Filter change

      // Initial render
      await act(async () => {
        await PlantService.getPlants();
      });

      // Trigger filter change
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      // Capture loading state during filter
      expect(toJSON()).toMatchSnapshot('filter-transition-loading');

      // Complete filter change
      await act(async () => {
        resolveFilteredPlants([]);
      });
    });

    it('shows loading state during sort calculation', async () => {
      const mockPlants = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `Plant ${i}`,
        type: 'indoor',
        nextWatering: new Date(),
        moistureData: [{ timestamp: new Date(), moisture: 60 }],
      }));

      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      // Trigger complex sort
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-moisture'));
        fireEvent.press(getByTestId('secondary-menu-item-nextWatering'));
      });

      // Capture loading state during sort
      expect(toJSON()).toMatchSnapshot('sort-calculation-loading');
    });
  });

  describe('Component-Level Loading', () => {
    it('shows moisture timeline loading state', async () => {
      let resolveMoisture: (value: any) => void;
      const moisturePromise = new Promise(resolve => {
        resolveMoisture = resolve;
      });
      (WeatherService.getMoistureForecast as jest.Mock).mockImplementation(() => moisturePromise);

      const { toJSON, getByTestId } = renderWithTheme(
        <Dashboard
          plants={[
            {
              id: '1',
              name: 'Test Plant',
              type: 'indoor',
              nextWatering: new Date(),
              moistureData: [],
            },
          ]}
        />
      );

      // Expand moisture timeline
      await act(async () => {
        fireEvent.press(getByTestId('moisture-timeline-toggle'));
      });

      // Capture loading state
      expect(toJSON()).toMatchSnapshot('moisture-timeline-loading');

      // Complete loading
      await act(async () => {
        resolveMoisture([]);
      });
    });

    it('shows weather info loading state', async () => {
      let resolveWeather: (value: any) => void;
      const weatherPromise = new Promise(resolve => {
        resolveWeather = resolve;
      });
      (WeatherService.getCurrentConditions as jest.Mock).mockImplementation(() => weatherPromise);

      const { toJSON } = renderWithTheme(
        <Dashboard
          plants={[
            {
              id: '1',
              name: 'Outdoor Plant',
              type: 'outdoor',
              nextWatering: new Date(),
              moistureData: [],
            },
          ]}
        />
      );

      // Capture weather loading state
      expect(toJSON()).toMatchSnapshot('weather-info-loading');

      await act(async () => {
        resolveWeather({});
      });
    });

    it('shows smart watering calculation loading state', async () => {
      let resolveCalculation: (value: any) => void;
      const calculationPromise = new Promise(resolve => {
        resolveCalculation = resolve;
      });
      (PlantService.calculateSmartWatering as jest.Mock).mockImplementation(
        () => calculationPromise
      );

      const { toJSON, getByTestId } = renderWithTheme(
        <Dashboard
          plants={[
            {
              id: '1',
              name: 'Test Plant',
              type: 'indoor',
              nextWatering: new Date(),
              moistureData: [],
            },
          ]}
        />
      );

      // Toggle smart watering
      await act(async () => {
        fireEvent.press(getByTestId('smart-watering-toggle'));
      });

      // Capture calculation loading state
      expect(toJSON()).toMatchSnapshot('smart-watering-loading');

      await act(async () => {
        resolveCalculation({});
      });
    });
  });

  describe('Accessibility During Loading', () => {
    it('announces loading states to screen readers', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );

      let resolvePlants: (value: any) => void;
      const plantsPromise = new Promise(resolve => {
        resolvePlants = resolve;
      });
      (PlantService.getPlants as jest.Mock).mockImplementation(() => plantsPromise);

      renderWithTheme(<Dashboard />);

      // Verify loading announcement
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('loading')
      );

      await act(async () => {
        resolvePlants([]);
      });

      // Verify completion announcement
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('loaded')
      );
    });

    it('maintains ARIA roles during loading', async () => {
      const { getByTestId } = renderWithTheme(<Dashboard />);

      // Verify loading indicators have correct ARIA roles
      const loadingSpinner = getByTestId('loading-spinner');
      expect(loadingSpinner.props.accessibilityRole).toBe('progressbar');
      expect(loadingSpinner.props['aria-busy']).toBe(true);
    });
  });
});
