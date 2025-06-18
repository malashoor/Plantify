import { RetryQueue } from '../utils/RetryQueue';
import { PlantService } from './PlantService';
import { WeatherService } from './WeatherService';
import { JournalService } from './JournalService';
import { SmartWateringService } from './SmartWateringService';
import { Plant, WeatherData, JournalEntry, WateringRecommendation } from '../types/api';

/**
 * Operation registry keys for type safety
 */
export const RetryOperationKeys = {
  // Plant operations
  SAVE_PLANT: 'savePlant',
  UPDATE_PLANT: 'updatePlant',
  DELETE_PLANT: 'deletePlant',
  
  // Weather operations
  FETCH_FORECAST: 'fetchForecast',
  UPDATE_WEATHER_CACHE: 'updateWeatherCache',
  
  // Journal operations
  ADD_JOURNAL_ENTRY: 'addJournalEntry',
  UPDATE_JOURNAL_ENTRY: 'updateJournalEntry',
  LOG_PLANT_MOOD: 'logPlantMood',
  
  // Watering operations
  UPDATE_WATERING_SCHEDULE: 'updateWateringSchedule',
  SYNC_WATERING_HISTORY: 'syncWateringHistory',
  UPDATE_RECOMMENDATIONS: 'updateRecommendations'
} as const;

export type RetryOperationKey = typeof RetryOperationKeys[keyof typeof RetryOperationKeys];

/**
 * Register all retryable operations with the queue
 */
export function registerRetryOperations(retryQueue: RetryQueue) {
  // Plant operations
  retryQueue.registerOperation(
    RetryOperationKeys.SAVE_PLANT,
    async (plant: Plant) => {
      const result = await PlantService.savePlant(plant);
      return result;
    }
  );

  retryQueue.registerOperation(
    RetryOperationKeys.UPDATE_PLANT,
    async (plantId: string, updates: Partial<Plant>) => {
      const result = await PlantService.updatePlant(plantId, updates);
      return result;
    }
  );

  retryQueue.registerOperation(
    RetryOperationKeys.DELETE_PLANT,
    async (plantId: string) => {
      await PlantService.deletePlant(plantId);
    }
  );

  // Weather operations
  retryQueue.registerOperation(
    RetryOperationKeys.FETCH_FORECAST,
    async (latitude: number, longitude: number) => {
      const forecast = await WeatherService.getForecast(latitude, longitude);
      return forecast;
    }
  );

  retryQueue.registerOperation(
    RetryOperationKeys.UPDATE_WEATHER_CACHE,
    async (data: WeatherData) => {
      await WeatherService.updateCache(data);
    }
  );

  // Journal operations
  retryQueue.registerOperation(
    RetryOperationKeys.ADD_JOURNAL_ENTRY,
    async (entry: JournalEntry) => {
      const result = await JournalService.addEntry(entry);
      return result;
    }
  );

  retryQueue.registerOperation(
    RetryOperationKeys.UPDATE_JOURNAL_ENTRY,
    async (entryId: string, updates: Partial<JournalEntry>) => {
      const result = await JournalService.updateEntry(entryId, updates);
      return result;
    }
  );

  retryQueue.registerOperation(
    RetryOperationKeys.LOG_PLANT_MOOD,
    async (plantId: string, mood: number, note?: string) => {
      await JournalService.logPlantMood(plantId, mood, note);
    }
  );

  // Watering operations
  retryQueue.registerOperation(
    RetryOperationKeys.UPDATE_WATERING_SCHEDULE,
    async (plantId: string, schedule: any) => {
      await SmartWateringService.updateSchedule(plantId, schedule);
    }
  );

  retryQueue.registerOperation(
    RetryOperationKeys.SYNC_WATERING_HISTORY,
    async (plantId: string, history: any[]) => {
      await SmartWateringService.syncHistory(plantId, history);
    }
  );

  retryQueue.registerOperation(
    RetryOperationKeys.UPDATE_RECOMMENDATIONS,
    async (plantId: string) => {
      const recommendations = await SmartWateringService.updateRecommendations(plantId);
      return recommendations;
    }
  );
}

/**
 * Helper to create operation data with type safety
 */
export function createOperationData<T extends any[]>(data: T): string {
  return JSON.stringify(data);
}

/**
 * Helper to generate unique operation IDs
 */
export function generateOperationId(key: RetryOperationKey, uniqueId: string): string {
  return `${key}-${uniqueId}-${Date.now()}`;
} 