import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';
import { Dashboard } from '../Dashboard';
import { Plant } from '../../../types/plant';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
}));

// Mock AccessibilityInfo
jest.mock('react-native/Libraries/Utilities/AccessibilityInfo', () => ({
  announceForAccessibility: jest.fn(),
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Dashboard Integration', () => {
  const mockPlants: Plant[] = [
    {
      id: '1',
      name: 'Indoor Aloe',
      type: 'indoor',
      nextWatering: new Date('2024-03-20'),
      moistureData: [{ timestamp: new Date(), moisture: 60 }],
    },
    {
      id: '2',
      name: 'Outdoor Bamboo',
      type: 'outdoor',
      nextWatering: new Date('2024-03-19'),
      moistureData: [{ timestamp: new Date(), moisture: 75 }],
    },
    {
      id: '3',
      name: 'Indoor Cactus',
      type: 'indoor',
      nextWatering: new Date('2024-03-21'),
      moistureData: [{ timestamp: new Date(), moisture: 30 }],
    },
    {
      id: '4',
      name: 'Hydroponic Basil',
      type: 'hydroponic',
      nextWatering: new Date('2024-03-20'),
      moistureData: [{ timestamp: new Date(), moisture: 85 }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mocks
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (AsyncStorage.multiGet as jest.Mock).mockImplementation(() => Promise.resolve([]));
  });

  describe('Initial Load', () => {
    it('should load and display all plants by default', async () => {
      const { getAllByTestId } = render(<Dashboard plants={mockPlants} />);

      await waitFor(() => {
        const plantItems = getAllByTestId('plant-item');
        expect(plantItems).toHaveLength(mockPlants.length);
      });
    });

    it('should restore saved filter and sort preferences', async () => {
      // Mock saved preferences
      const savedPreferences = [
        ['@plantai:filter_preference', 'indoor'],
        [
          '@plantai:dashboard_sort',
          JSON.stringify({
            primary: { criteria: 'name', direction: 'asc' },
            secondary: null,
          }),
        ],
      ];

      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue(savedPreferences);

      const { getAllByTestId, getByTestId } = render(<Dashboard plants={mockPlants} />);

      await waitFor(() => {
        // Should only show indoor plants
        const plantItems = getAllByTestId('plant-item');
        expect(plantItems).toHaveLength(2);

        // Filter tab should be selected
        const indoorTab = getByTestId('filter-tab-indoor');
        expect(indoorTab).toHaveAccessibilityState({ selected: true });

        // Plants should be sorted by name
        const plantNames = plantItems.map(item => item.props.accessibilityLabel);
        expect(plantNames).toEqual(['Indoor Aloe', 'Indoor Cactus']);
      });
    });
  });

  describe('Filter and Sort Interaction', () => {
    it('should apply filter then sort', async () => {
      const { getByTestId, getAllByTestId } = render(<Dashboard plants={mockPlants} />);

      // Select indoor filter
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      // Open sort menu and select name sort
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-name'));
      });

      await waitFor(() => {
        const plantItems = getAllByTestId('plant-item');
        const plantNames = plantItems.map(item => item.props.accessibilityLabel);
        expect(plantNames).toEqual(['Indoor Aloe', 'Indoor Cactus']);
      });

      // Verify accessibility announcement
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('indoor')
      );
    });

    it('should maintain sort when changing filters', async () => {
      const { getByTestId, getAllByTestId } = render(<Dashboard plants={mockPlants} />);

      // Set name sort first
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-name'));
      });

      // Then switch between filters
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      await waitFor(() => {
        const indoorPlants = getAllByTestId('plant-item');
        const indoorNames = indoorPlants.map(item => item.props.accessibilityLabel);
        expect(indoorNames).toEqual(['Indoor Aloe', 'Indoor Cactus']);
      });

      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-outdoor'));
      });

      await waitFor(() => {
        const outdoorPlants = getAllByTestId('plant-item');
        const outdoorNames = outdoorPlants.map(item => item.props.accessibilityLabel);
        expect(outdoorNames).toEqual(['Outdoor Bamboo']);
      });
    });

    it('should handle secondary sort with ties', async () => {
      const { getByTestId, getAllByTestId } = render(<Dashboard plants={mockPlants} />);

      // Set nextWatering as primary sort
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-nextWatering'));
      });

      // Add name as secondary sort
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('secondary-menu-item-name'));
      });

      await waitFor(() => {
        const plantItems = getAllByTestId('plant-item');
        const plantNames = plantItems.map(item => item.props.accessibilityLabel);
        // Plants with same watering date should be sorted by name
        expect(plantNames).toEqual([
          'Outdoor Bamboo',
          'Indoor Aloe',
          'Hydroponic Basil',
          'Indoor Cactus',
        ]);
      });
    });
  });

  describe('Persistence', () => {
    it('should save filter and sort preferences', async () => {
      const { getByTestId } = render(<Dashboard plants={mockPlants} />);

      // Change filter and sort
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-name'));
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@plantai:filter_preference', 'indoor');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@plantai:dashboard_sort',
          expect.stringContaining('name')
        );
      });
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { getByTestId, getAllByTestId } = render(<Dashboard plants={mockPlants} />);

      // Should still work despite storage error
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      await waitFor(() => {
        const plantItems = getAllByTestId('plant-item');
        expect(plantItems).toHaveLength(2); // Only indoor plants
      });
    });
  });

  describe('Accessibility', () => {
    it('should announce filter changes', async () => {
      const { getByTestId } = render(<Dashboard plants={mockPlants} />);

      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('indoor')
      );
    });

    it('should announce sort changes', async () => {
      const { getByTestId } = render(<Dashboard plants={mockPlants} />);

      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-name'));
      });

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('name')
      );
    });

    it('should handle screen reader navigation', async () => {
      const { getByTestId, getAllByTestId } = render(<Dashboard plants={mockPlants} />);

      const filterTabs = getAllByTestId(/^filter-tab-/);
      const sortButton = getByTestId('sort-button');
      const plantItems = getAllByTestId('plant-item');

      // Verify accessibility props
      filterTabs.forEach(tab => {
        expect(tab.props.accessibilityRole).toBe('tab');
        expect(tab.props.accessibilityState).toBeDefined();
      });

      expect(sortButton.props.accessibilityRole).toBe('button');
      expect(sortButton.props.accessibilityHint).toBeDefined();

      plantItems.forEach(item => {
        expect(item.props.accessibilityLabel).toBeDefined();
        expect(item.props.accessibilityHint).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty plant list', async () => {
      const { getByTestId } = render(<Dashboard plants={[]} />);

      await waitFor(() => {
        expect(getByTestId('empty-state')).toBeTruthy();
      });
    });

    it('should handle rapid filter/sort changes', async () => {
      const { getByTestId } = render(<Dashboard plants={mockPlants} />);

      await act(async () => {
        // Rapid changes
        fireEvent.press(getByTestId('filter-tab-indoor'));
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-name'));
        fireEvent.press(getByTestId('filter-tab-outdoor'));
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-moisture'));
      });

      // Should settle in a valid state
      await waitFor(() => {
        expect(getByTestId('filter-tab-outdoor')).toHaveAccessibilityState({ selected: true });
      });
    });

    it('should handle RTL layout transitions', async () => {
      const { getByTestId, rerender } = render(<Dashboard plants={mockPlants} isRTL={false} />);

      // Change to RTL
      rerender(<Dashboard plants={mockPlants} isRTL={true} />);

      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      // Should maintain functionality in RTL
      await waitFor(() => {
        expect(getByTestId('filter-tab-indoor')).toHaveAccessibilityState({ selected: true });
      });
    });
  });
});
