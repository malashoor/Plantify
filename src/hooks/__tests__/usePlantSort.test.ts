import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlantSort } from '../usePlantSort';
import { Plant } from '../../types/plant';
import { SortConfig } from '../../components/dashboard/SortControl';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock react-native's AccessibilityInfo
jest.mock('react-native/Libraries/Utilities/AccessibilityInfo', () => ({
  announceForAccessibility: jest.fn(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('usePlantSort', () => {
  const mockPlants: Plant[] = [
    {
      id: '1',
      name: 'Aloe Vera',
      nextWatering: new Date('2024-03-20'),
      moistureData: [{ timestamp: new Date(), moisture: 60 }],
    },
    {
      id: '2',
      name: 'Bamboo',
      nextWatering: new Date('2024-03-19'),
      moistureData: [{ timestamp: new Date(), moisture: 75 }],
    },
    {
      id: '3',
      name: 'Cactus',
      nextWatering: new Date('2024-03-21'),
      moistureData: [{ timestamp: new Date(), moisture: 30 }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default sort config', () => {
      const { result } = renderHook(() => usePlantSort(mockPlants));
      
      expect(result.current.currentSort).toEqual({
        primary: {
          criteria: 'nextWatering',
          direction: 'asc',
        },
        secondary: null,
      });
    });

    it('should load saved sort config from storage', async () => {
      const savedConfig: SortConfig = {
        primary: {
          criteria: 'name',
          direction: 'desc',
        },
        secondary: {
          criteria: 'moisture',
          direction: 'asc',
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedConfig));

      const { result, waitForNextUpdate } = renderHook(() => usePlantSort(mockPlants));
      await waitForNextUpdate();

      expect(result.current.currentSort).toEqual(savedConfig);
    });

    it('should handle corrupted storage data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const { result } = renderHook(() => usePlantSort(mockPlants));
      
      expect(result.current.currentSort).toEqual({
        primary: {
          criteria: 'nextWatering',
          direction: 'asc',
        },
        secondary: null,
      });
    });
  });

  describe('Primary Sort', () => {
    it('should sort by name ascending', () => {
      const { result } = renderHook(() => usePlantSort(mockPlants));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'name',
            direction: 'asc',
          },
          secondary: null,
        });
      });

      const sortedNames = result.current.sortedPlants.map(p => p.name);
      expect(sortedNames).toEqual(['Aloe Vera', 'Bamboo', 'Cactus']);
    });

    it('should sort by name descending', () => {
      const { result } = renderHook(() => usePlantSort(mockPlants));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'name',
            direction: 'desc',
          },
          secondary: null,
        });
      });

      const sortedNames = result.current.sortedPlants.map(p => p.name);
      expect(sortedNames).toEqual(['Cactus', 'Bamboo', 'Aloe Vera']);
    });

    it('should sort by moisture ascending', () => {
      const { result } = renderHook(() => usePlantSort(mockPlants));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'moisture',
            direction: 'asc',
          },
          secondary: null,
        });
      });

      const sortedMoistures = result.current.sortedPlants.map(
        p => p.moistureData[p.moistureData.length - 1].moisture
      );
      expect(sortedMoistures).toEqual([30, 60, 75]);
    });

    it('should sort by nextWatering ascending', () => {
      const { result } = renderHook(() => usePlantSort(mockPlants));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'nextWatering',
            direction: 'asc',
          },
          secondary: null,
        });
      });

      const sortedDates = result.current.sortedPlants.map(p => p.nextWatering.toISOString());
      expect(sortedDates).toEqual([
        new Date('2024-03-19').toISOString(),
        new Date('2024-03-20').toISOString(),
        new Date('2024-03-21').toISOString(),
      ]);
    });
  });

  describe('Secondary Sort', () => {
    const plantsWithTies: Plant[] = [
      {
        id: '1',
        name: 'Aloe',
        nextWatering: new Date('2024-03-20'),
        moistureData: [{ timestamp: new Date(), moisture: 60 }],
      },
      {
        id: '2',
        name: 'Bamboo',
        nextWatering: new Date('2024-03-20'),
        moistureData: [{ timestamp: new Date(), moisture: 75 }],
      },
      {
        id: '3',
        name: 'Cactus',
        nextWatering: new Date('2024-03-21'),
        moistureData: [{ timestamp: new Date(), moisture: 30 }],
      },
    ];

    it('should apply secondary sort for tied values', () => {
      const { result } = renderHook(() => usePlantSort(plantsWithTies));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'nextWatering',
            direction: 'asc',
          },
          secondary: {
            criteria: 'name',
            direction: 'asc',
          },
        });
      });

      const sortedNames = result.current.sortedPlants.map(p => p.name);
      expect(sortedNames).toEqual(['Aloe', 'Bamboo', 'Cactus']);
    });

    it('should respect secondary sort direction', () => {
      const { result } = renderHook(() => usePlantSort(plantsWithTies));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'nextWatering',
            direction: 'asc',
          },
          secondary: {
            criteria: 'name',
            direction: 'desc',
          },
        });
      });

      const sortedNames = result.current.sortedPlants.map(p => p.name);
      expect(sortedNames).toEqual(['Bamboo', 'Aloe', 'Cactus']);
    });
  });

  describe('Edge Cases', () => {
    const plantsWithNulls: Plant[] = [
      {
        id: '1',
        name: 'Aloe',
        nextWatering: null as any,
        moistureData: [],
      },
      {
        id: '2',
        name: 'Bamboo',
        nextWatering: new Date('2024-03-20'),
        moistureData: [{ timestamp: new Date(), moisture: 75 }],
      },
      {
        id: '3',
        name: 'Cactus',
        nextWatering: new Date('2024-03-21'),
        moistureData: [],
      },
    ];

    it('should handle null values in nextWatering', () => {
      const { result } = renderHook(() => usePlantSort(plantsWithNulls));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'nextWatering',
            direction: 'asc',
          },
          secondary: null,
        });
      });

      expect(result.current.sortedPlants[0].name).toBe('Bamboo');
      expect(result.current.sortedPlants[1].name).toBe('Cactus');
      expect(result.current.sortedPlants[2].name).toBe('Aloe');
    });

    it('should handle empty moistureData array', () => {
      const { result } = renderHook(() => usePlantSort(plantsWithNulls));

      act(() => {
        result.current.onSortChange({
          primary: {
            criteria: 'moisture',
            direction: 'desc',
          },
          secondary: null,
        });
      });

      expect(result.current.sortedPlants[0].name).toBe('Bamboo');
    });
  });

  describe('Persistence', () => {
    it('should save sort config to storage on change', async () => {
      const { result } = renderHook(() => usePlantSort(mockPlants));
      const newConfig: SortConfig = {
        primary: {
          criteria: 'name',
          direction: 'desc',
        },
        secondary: null,
      };

      await act(async () => {
        await result.current.onSortChange(newConfig);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(newConfig)
      );
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const { result } = renderHook(() => usePlantSort(mockPlants));
      const newConfig: SortConfig = {
        primary: {
          criteria: 'name',
          direction: 'desc',
        },
        secondary: null,
      };

      await act(async () => {
        await result.current.onSortChange(newConfig);
      });

      // Should still update local state despite storage error
      expect(result.current.currentSort).toEqual(newConfig);
    });
  });
}); 