import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterType } from '../components/dashboard/FilterTabs';
import { SortConfig } from '../components/dashboard/SortControl';

const STORAGE_KEYS = {
  DASHBOARD_FILTER: 'plantai:dashboard:filter',
  DASHBOARD_SORT: '@plantai:dashboard_sort',
  FILTER_PREFERENCE: '@plantai:filter_preference',
  REDUCED_MOTION: '@plantai:reduced_motion',
} as const;

class StorageService {
  async getDashboardFilter(): Promise<FilterType | null> {
    try {
      const filter = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_FILTER);
      if (filter && this.isValidFilterType(filter)) {
        return filter as FilterType;
      }
      return null;
    } catch (error) {
      console.error('Failed to load dashboard filter:', error);
      return null;
    }
  }

  async setDashboardFilter(filter: FilterType): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_FILTER, filter);
    } catch (error) {
      console.error('Failed to save dashboard filter:', error);
    }
  }

  async getDashboardSort(): Promise<SortConfig | null> {
    try {
      const sortJson = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_SORT);
      return sortJson ? JSON.parse(sortJson) : null;
    } catch (error) {
      console.error('Failed to get dashboard sort:', error);
      return null;
    }
  }

  async setDashboardSort(sort: SortConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_SORT, JSON.stringify(sort));
    } catch (error) {
      console.error('Failed to save dashboard sort:', error);
      throw error;
    }
  }

  private isValidFilterType(filter: string): boolean {
    return ['all', 'indoor', 'outdoor', 'hydroponic'].includes(filter);
  }

  private isValidSortCriteria(sort: string): boolean {
    return ['nextWatering', 'moisture', 'name'].includes(sort);
  }
}

export const storageService = new StorageService();
