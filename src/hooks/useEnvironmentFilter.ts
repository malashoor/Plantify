import { useMemo, useState, useCallback, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import { FilterType } from '../components/dashboard/FilterTabs';
import { Plant } from '../types/plant';
import { storageService } from '../services/StorageService';
import { useTranslation } from 'react-i18next';

export const useEnvironmentFilter = (plants: Plant[]) => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [isInitialized, setIsInitialized] = useState(false);
  const { t } = useTranslation();

  // Load saved filter on mount
  useEffect(() => {
    const loadSavedFilter = async () => {
      try {
        const savedFilter = await storageService.getDashboardFilter();
        if (savedFilter) {
          setCurrentFilter(savedFilter);
          // Announce filter restoration for accessibility
          AccessibilityInfo.announceForAccessibility(
            t('filters.accessibility.restored', {
              filter: t(`filters.${savedFilter}`),
            })
          );
        }
      } catch (error) {
        console.error('Failed to load saved filter:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSavedFilter();
  }, [t]);

  const filteredPlants = useMemo(() => {
    if (currentFilter === 'all') {
      return plants;
    }

    if (currentFilter === 'hydroponic') {
      return plants.filter(plant => plant.growingMethodType === 'hydroponic');
    }

    return plants.filter(plant => plant.environment === currentFilter);
  }, [plants, currentFilter]);

  const counts = useMemo(() => {
    const hydroponicCount = plants.filter(plant => plant.growingMethodType === 'hydroponic').length;
    const indoorCount = plants.filter(plant => plant.environment === 'indoor').length;
    const outdoorCount = plants.filter(plant => plant.environment === 'outdoor').length;

    return {
      all: plants.length,
      indoor: indoorCount,
      outdoor: outdoorCount,
      hydroponic: hydroponicCount,
    };
  }, [plants]);

  const handleFilterChange = useCallback(
    async (filter: FilterType) => {
      setCurrentFilter(filter);

      // Persist filter change
      try {
        await storageService.setDashboardFilter(filter);
        // Announce filter change for accessibility
        AccessibilityInfo.announceForAccessibility(
          t('filters.accessibility.changed', {
            filter: t(`filters.${filter}`),
          })
        );
      } catch (error) {
        console.error('Failed to save filter:', error);
      }
    },
    [t]
  );

  return {
    currentFilter,
    filteredPlants,
    counts,
    onFilterChange: handleFilterChange,
    isInitialized,
  };
};
