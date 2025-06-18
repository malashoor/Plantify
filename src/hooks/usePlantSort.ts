import { useState, useEffect, useMemo, useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SortConfig } from '../components/dashboard/SortControl';
import { Plant } from '../types/plant';
import { storageService } from '../services/StorageService';

const DEFAULT_SORT: SortConfig = {
  primary: {
    criteria: 'nextWatering',
    direction: 'asc',
  },
  secondary: null,
};

export const usePlantSort = (plants: Plant[]) => {
  const [currentSort, setCurrentSort] = useState<SortConfig>(DEFAULT_SORT);
  const [isInitialized, setIsInitialized] = useState(false);
  const { t } = useTranslation();

  // Load saved sort on mount
  useEffect(() => {
    const loadSavedSort = async () => {
      try {
        const savedSort = await storageService.getDashboardSort();
        if (savedSort) {
          setCurrentSort(savedSort);
          // Announce sort restoration for accessibility
          AccessibilityInfo.announceForAccessibility(
            t('sorting.accessibility.restored', {
              criteria: getSortDescription(savedSort, t),
            })
          );
        }
      } catch (error) {
        console.error('Failed to load saved sort:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSavedSort();
  }, [t]);

  const compareValues = useCallback((a: any, b: any, direction: 'asc' | 'desc'): number => {
    let result = 0;
    if (a === b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    if (typeof a === 'string') {
      result = a.localeCompare(b);
    } else {
      result = a - b;
    }
    return direction === 'asc' ? result : -result;
  }, []);

  const getPlantValue = useCallback((plant: Plant, criteria: string) => {
    switch (criteria) {
      case 'nextWatering':
        return plant.nextWatering;
      case 'moisture':
        return plant.moistureData[plant.moistureData.length - 1]?.moisture ?? 0;
      case 'name':
        return plant.name;
      default:
        return null;
    }
  }, []);

  const sortedPlants = useMemo(() => {
    return [...plants].sort((a, b) => {
      // Primary sort
      const primaryA = getPlantValue(a, currentSort.primary.criteria);
      const primaryB = getPlantValue(b, currentSort.primary.criteria);
      const primaryResult = compareValues(
        primaryA,
        primaryB,
        currentSort.primary.direction
      );

      // If primary values are equal and we have a secondary sort, use it
      if (primaryResult === 0 && currentSort.secondary) {
        const secondaryA = getPlantValue(a, currentSort.secondary.criteria);
        const secondaryB = getPlantValue(b, currentSort.secondary.criteria);
        return compareValues(
          secondaryA,
          secondaryB,
          currentSort.secondary.direction
        );
      }

      return primaryResult;
    });
  }, [plants, currentSort, getPlantValue, compareValues]);

  const handleSortChange = useCallback(async (config: SortConfig) => {
    setCurrentSort(config);
    
    // Persist sort change
    try {
      await storageService.setDashboardSort(config);
      // Announce sort change for accessibility
      AccessibilityInfo.announceForAccessibility(
        t('sorting.accessibility.changed', {
          criteria: getSortDescription(config, t),
        })
      );
    } catch (error) {
      console.error('Failed to save sort:', error);
    }
  }, [t]);

  return {
    currentSort,
    sortedPlants,
    onSortChange: handleSortChange,
    isInitialized,
  };
};

// Helper function to get sort description
function getSortDescription(config: SortConfig, t: (key: string, params?: any) => string): string {
  const primary = t(`sorting.criteria.${config.primary.criteria}`);
  const primaryDir = t(`sorting.direction.${config.primary.direction}`);
  
  if (!config.secondary) {
    return t('sorting.descriptionSingle', { criteria: primary, direction: primaryDir });
  }
  
  const secondary = t(`sorting.criteria.${config.secondary.criteria}`);
  const secondaryDir = t(`sorting.direction.${config.secondary.direction}`);
  return t('sorting.descriptionCombined', {
    primary,
    primaryDir,
    secondary,
    secondaryDir,
  });
} 