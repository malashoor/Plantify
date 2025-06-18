import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, Keyboard } from 'react-native';
import { Dashboard } from '../Dashboard';
import { Plant } from '../../../types/plant';
import { PlantService } from '../../../services/PlantService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native/Libraries/Utilities/AccessibilityInfo');
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard');
jest.mock('../../../services/PlantService');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Dashboard Complex Interactions', () => {
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([]);
    (PlantService.getPlants as jest.Mock).mockResolvedValue(mockPlants);
  });

  describe('Dynamic Update Flow', () => {
    it('should handle adding new plant while filtered and sorted', async () => {
      const { getByTestId, getAllByTestId, queryByText } = render(
        <Dashboard plants={mockPlants} />
      );

      // Apply indoor filter
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      // Verify only indoor plants shown
      await waitFor(() => {
        const plantItems = getAllByTestId('plant-item');
        expect(plantItems).toHaveLength(1);
        expect(queryByText('Indoor Aloe')).toBeTruthy();
      });

      // Sort by next watering descending
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-nextWatering'));
        fireEvent.press(getByTestId('direction-toggle-primary'));
      });

      // Add new indoor plant
      const newPlant: Plant = {
        id: '3',
        name: 'Indoor Snake Plant',
        type: 'indoor',
        nextWatering: new Date('2024-03-22'),
        moistureData: [{ timestamp: new Date(), moisture: 55 }],
      };

      await act(async () => {
        fireEvent.press(getByTestId('add-plant-button'));
        // Simulate form filling
        fireEvent.changeText(getByTestId('plant-name-input'), 'Indoor Snake Plant');
        fireEvent.press(getByTestId('type-indoor-radio'));
        fireEvent.press(getByTestId('save-plant-button'));
      });

      // Verify new plant appears in correct position
      await waitFor(() => {
        const plantItems = getAllByTestId('plant-item');
        expect(plantItems).toHaveLength(2);
        const plantNames = plantItems.map(item => item.props.accessibilityLabel);
        expect(plantNames).toEqual(['Indoor Snake Plant', 'Indoor Aloe']);
      });

      // Verify accessibility announcement
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('plant added')
      );
    });
  });

  describe('Preference Shift Across Sessions', () => {
    it('should maintain complex sort and filter state across sessions', async () => {
      // First session
      const { getByTestId, unmount } = render(<Dashboard plants={mockPlants} />);

      // Set up complex sort
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-moisture'));
        fireEvent.press(getByTestId('secondary-menu-item-name'));
        fireEvent.press(getByTestId('direction-toggle-secondary'));
      });

      // Filter to indoor
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      // Verify preferences were saved
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@plantai:dashboard_sort',
        expect.stringContaining('moisture')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@plantai:filter_preference', 'indoor');

      // Simulate app restart
      unmount();

      // Mock saved preferences for second session
      const savedPreferences = [
        ['@plantai:filter_preference', 'indoor'],
        [
          '@plantai:dashboard_sort',
          JSON.stringify({
            primary: { criteria: 'moisture', direction: 'asc' },
            secondary: { criteria: 'name', direction: 'desc' },
          }),
        ],
      ];
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue(savedPreferences);

      // Second session
      const { getAllByTestId, getByTestId: getByTestIdNew } = render(
        <Dashboard plants={mockPlants} />
      );

      // Verify state restored correctly
      await waitFor(() => {
        expect(getByTestIdNew('filter-tab-indoor')).toHaveAccessibilityState({ selected: true });
        const plantItems = getAllByTestId('plant-item');
        expect(plantItems).toHaveLength(1); // Only indoor plants
      });
    });
  });

  describe('Filter-Then-Edit Flow', () => {
    it('should handle plant environment changes while filtered', async () => {
      const { getByTestId, getAllByTestId, queryByText } = render(
        <Dashboard plants={mockPlants} />
      );

      // Filter to indoor plants
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-indoor'));
      });

      // Verify initial state
      await waitFor(() => {
        expect(queryByText('Indoor Aloe')).toBeTruthy();
        expect(queryByText('Outdoor Bamboo')).toBeFalsy();
      });

      // Edit Indoor Aloe to be outdoor
      await act(async () => {
        const plantItem = getAllByTestId('plant-item')[0];
        fireEvent.press(plantItem);
        fireEvent.press(getByTestId('edit-plant-button'));
        fireEvent.press(getByTestId('type-outdoor-radio'));
        fireEvent.press(getByTestId('save-plant-button'));
      });

      // Verify plant disappeared from indoor filter
      await waitFor(() => {
        expect(queryByText('Indoor Aloe')).toBeFalsy();
        expect(getAllByTestId('plant-item')).toHaveLength(0);
      });

      // Switch to outdoor filter
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-outdoor'));
      });

      // Verify plant appears in outdoor filter
      await waitFor(() => {
        expect(queryByText('Indoor Aloe')).toBeTruthy(); // Name hasn't changed
        expect(getAllByTestId('plant-item')).toHaveLength(2);
      });
    });
  });

  describe('Accessibility Consistency', () => {
    it('should maintain accessibility through RTL transitions', async () => {
      const { getByTestId, rerender } = render(<Dashboard plants={mockPlants} isRTL={false} />);

      // Set up initial state
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('menu-item-name'));
      });

      // Switch to RTL
      rerender(<Dashboard plants={mockPlants} isRTL={true} />);

      // Verify sort menu still works
      await act(async () => {
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByTestId('direction-toggle-primary'));
      });

      // Verify accessibility state maintained
      expect(getByTestId('sort-button')).toHaveAccessibilityHint(expect.any(String));

      // Test keyboard navigation
      await act(async () => {
        fireEvent.keyPress(getByTestId('filter-tab-indoor'), { key: 'Enter' });
      });

      expect(getByTestId('filter-tab-indoor')).toHaveAccessibilityState({
        selected: true,
      });
    });
  });

  describe('Empty + Error Transition Flow', () => {
    it('should handle transitions between empty, error, and populated states', async () => {
      // Start with no outdoor plants
      const indoorOnlyPlants = mockPlants.filter(p => p.type === 'indoor');
      const { getByTestId, queryByTestId, rerender } = render(
        <Dashboard plants={indoorOnlyPlants} />
      );

      // Filter to outdoor (empty state)
      await act(async () => {
        fireEvent.press(getByTestId('filter-tab-outdoor'));
      });

      // Verify empty state
      expect(getByTestId('empty-state')).toBeTruthy();

      // Simulate error state
      (PlantService.getPlants as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        fireEvent.press(getByTestId('refresh-button'));
      });

      // Verify error state
      expect(getByTestId('error-state')).toBeTruthy();

      // Recover and add outdoor plant
      (PlantService.getPlants as jest.Mock).mockResolvedValueOnce([
        ...indoorOnlyPlants,
        {
          id: '4',
          name: 'New Outdoor Plant',
          type: 'outdoor',
          nextWatering: new Date(),
          moistureData: [],
        },
      ]);

      await act(async () => {
        fireEvent.press(getByTestId('retry-button'));
      });

      // Verify recovery
      expect(queryByTestId('error-state')).toBeFalsy();
      expect(queryByTestId('empty-state')).toBeFalsy();
      expect(getByTestId('plant-list')).toBeTruthy();
    });
  });
});
