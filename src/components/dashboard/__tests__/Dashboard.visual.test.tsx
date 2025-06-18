import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import { Dashboard } from '../Dashboard';
import { Plant } from '../../../types/plant';
import { AccessibilityInfo, useWindowDimensions } from 'react-native';

// Mock dependencies
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
  }),
}));

jest.mock('react-native/Libraries/Utilities/AccessibilityInfo', () => ({
  isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Dashboard Visual Regression', () => {
  const mockPlants: Plant[] = [
    {
      id: '1',
      name: 'Indoor Aloe',
      type: 'indoor',
      nextWatering: new Date('2024-03-20'),
      moistureData: [{ timestamp: new Date(), moisture: 60 }],
      healthStatus: 'healthy',
      lastWatered: new Date('2024-03-15'),
    },
    {
      id: '2',
      name: 'Outdoor Bamboo',
      type: 'outdoor',
      nextWatering: new Date('2024-03-19'),
      moistureData: [{ timestamp: new Date(), moisture: 75 }],
      healthStatus: 'attention',
      lastWatered: new Date('2024-03-14'),
    },
    {
      id: '3',
      name: 'Hydroponic Basil',
      type: 'hydroponic',
      nextWatering: new Date('2024-03-21'),
      moistureData: [{ timestamp: new Date(), moisture: 85 }],
      healthStatus: 'healthy',
      lastWatered: new Date('2024-03-16'),
    },
  ];

  const renderWithTheme = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') => {
    const customTheme = {
      // Define your theme object here
      dark: theme === 'dark',
      colors:
        theme === 'dark'
          ? {
              primary: '#4CAF50',
              background: '#121212',
              surface: '#1E1E1E',
              text: '#FFFFFF',
              // ... other dark theme colors
            }
          : {
              primary: '#4CAF50',
              background: '#FFFFFF',
              surface: '#F5F5F5',
              text: '#000000',
              // ... other light theme colors
            },
    };

    return render(<ThemeProvider theme={customTheme}>{ui}</ThemeProvider>);
  };

  describe('Dashboard States', () => {
    it('renders default state in LTR', () => {
      const { toJSON } = renderWithTheme(<Dashboard plants={mockPlants} isRTL={false} />);
      expect(toJSON()).toMatchSnapshot('default-ltr');
    });

    it('renders default state in RTL', () => {
      const { toJSON } = renderWithTheme(<Dashboard plants={mockPlants} isRTL={true} />);
      expect(toJSON()).toMatchSnapshot('default-rtl');
    });

    it('renders empty state', () => {
      const { toJSON } = renderWithTheme(<Dashboard plants={[]} />);
      expect(toJSON()).toMatchSnapshot('empty-state');
    });

    it('renders filtered states', () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      // Capture indoor filter
      fireEvent.press(getByTestId('filter-tab-indoor'));
      expect(toJSON()).toMatchSnapshot('filtered-indoor');

      // Capture outdoor filter
      fireEvent.press(getByTestId('filter-tab-outdoor'));
      expect(toJSON()).toMatchSnapshot('filtered-outdoor');

      // Capture hydroponic filter
      fireEvent.press(getByTestId('filter-tab-hydroponic'));
      expect(toJSON()).toMatchSnapshot('filtered-hydroponic');
    });

    it('renders sorted states', () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      // Sort by name ascending
      fireEvent.press(getByTestId('sort-button'));
      fireEvent.press(getByTestId('menu-item-name'));
      expect(toJSON()).toMatchSnapshot('sorted-name-asc');

      // Sort by name descending
      fireEvent.press(getByTestId('direction-toggle-primary'));
      expect(toJSON()).toMatchSnapshot('sorted-name-desc');

      // Sort by moisture with secondary
      fireEvent.press(getByTestId('menu-item-moisture'));
      fireEvent.press(getByTestId('secondary-menu-item-name'));
      expect(toJSON()).toMatchSnapshot('sorted-moisture-name');
    });
  });

  describe('Interactive States', () => {
    it('renders sort menu open state', () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      fireEvent.press(getByTestId('sort-button'));
      expect(toJSON()).toMatchSnapshot('sort-menu-open');
    });

    it('renders filter tab transitions', () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      // Capture mid-transition state
      fireEvent.press(getByTestId('filter-tab-indoor'));
      // Note: In a real app, you'd need to mock the animation timing
      expect(toJSON()).toMatchSnapshot('filter-transition');
    });

    it('renders environment icons and badges', () => {
      const { toJSON } = renderWithTheme(<Dashboard plants={mockPlants} />);
      expect(toJSON()).toMatchSnapshot('environment-indicators');
    });
  });

  describe('Dynamic Transitions', () => {
    it('renders before and after adding plant', async () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      // Before adding
      expect(toJSON()).toMatchSnapshot('before-add');

      // Add new plant
      fireEvent.press(getByTestId('add-plant-button'));
      const newPlant: Plant = {
        id: '4',
        name: 'New Plant',
        type: 'indoor',
        nextWatering: new Date(),
        moistureData: [],
        healthStatus: 'healthy',
        lastWatered: new Date(),
      };

      // After adding
      await act(async () => {
        // Simulate plant addition
        fireEvent.changeText(getByTestId('plant-name-input'), newPlant.name);
        fireEvent.press(getByTestId('save-plant-button'));
      });

      expect(toJSON()).toMatchSnapshot('after-add');
    });

    it('renders moisture forecast timeline', () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      fireEvent.press(getByTestId('moisture-timeline-toggle'));
      expect(toJSON()).toMatchSnapshot('moisture-timeline-expanded');
    });

    it('renders smart watering alerts', () => {
      const plantsWithAlerts = mockPlants.map(plant => ({
        ...plant,
        alerts: [
          {
            type: 'watering_needed',
            message: 'Plant needs water soon',
            severity: 'warning',
          },
        ],
      }));

      const { toJSON } = renderWithTheme(<Dashboard plants={plantsWithAlerts} />);
      expect(toJSON()).toMatchSnapshot('watering-alerts');
    });
  });

  describe('Accessibility Modes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders with high contrast mode', () => {
      const highContrastTheme = {
        dark: false,
        colors: {
          primary: '#000000',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: '#000000',
          // High contrast specific colors
          accent: '#000000',
          border: '#000000',
        },
      };

      const { toJSON } = render(
        <ThemeProvider theme={highContrastTheme}>
          <Dashboard plants={mockPlants} highContrast={true} />
        </ThemeProvider>
      );
      expect(toJSON()).toMatchSnapshot('high-contrast');
    });

    it('renders with reduced motion', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );

      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />);

      // Trigger an animation
      fireEvent.press(getByTestId('filter-tab-indoor'));
      expect(toJSON()).toMatchSnapshot('reduced-motion');
    });

    it('renders with large font scaling', () => {
      (useWindowDimensions as jest.Mock).mockImplementation(() => ({
        width: 375,
        height: 812,
        scale: 1,
        fontScale: 1.5, // Large font scale
      }));

      const { toJSON } = renderWithTheme(<Dashboard plants={mockPlants} />);
      expect(toJSON()).toMatchSnapshot('large-font');
    });
  });

  describe('Dark Mode', () => {
    it('renders dark mode states', () => {
      const { toJSON, getByTestId } = renderWithTheme(<Dashboard plants={mockPlants} />, 'dark');

      // Default dark mode
      expect(toJSON()).toMatchSnapshot('dark-mode-default');

      // Dark mode with sort menu
      fireEvent.press(getByTestId('sort-button'));
      expect(toJSON()).toMatchSnapshot('dark-mode-sort-menu');

      // Dark mode with filter
      fireEvent.press(getByTestId('filter-tab-indoor'));
      expect(toJSON()).toMatchSnapshot('dark-mode-filtered');
    });
  });
});
