import { WeatherData } from './WeatherService';
import { Seed } from '../types/seed';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WateringAdjustment {
  shouldSkip: boolean;
  shouldIncrease: boolean;
  nextWateringDate: Date;
  recommendation: string;
  reason: string;
}

interface SmartWateringPreferences {
  enabled: boolean;
  rainSkipThreshold: number; // mm of rain forecast to skip watering
  heatIncreaseThreshold: number; // °C to trigger increased watering
  windSpeedThreshold: number; // m/s to consider increased evaporation
  lowHumidityThreshold: number; // % to consider increased watering
}

const DEFAULT_PREFERENCES: SmartWateringPreferences = {
  enabled: true,
  rainSkipThreshold: 5, // mm
  heatIncreaseThreshold: 30, // °C
  windSpeedThreshold: 15, // m/s
  lowHumidityThreshold: 30, // %
};

const PREFERENCES_KEY = '@greensai:smart_watering_preferences';

export class SmartWateringService {
  static async getPreferences(): Promise<SmartWateringPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading smart watering preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }

  static async setPreferences(prefs: Partial<SmartWateringPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...prefs };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving smart watering preferences:', error);
    }
  }

  static async evaluateWatering(
    seed: Seed,
    weather: WeatherData,
    scheduledDate: Date
  ): Promise<WateringAdjustment> {
    const prefs = await this.getPreferences();

    if (!prefs.enabled) {
      return {
        shouldSkip: false,
        shouldIncrease: false,
        nextWateringDate: scheduledDate,
        recommendation: '',
        reason: 'Smart watering is disabled',
      };
    }

    const adjustment: WateringAdjustment = {
      shouldSkip: false,
      shouldIncrease: false,
      nextWateringDate: scheduledDate,
      recommendation: '',
      reason: '',
    };

    // Check rain forecast
    if (weather.rainForecast && weather.rainForecast >= prefs.rainSkipThreshold) {
      adjustment.shouldSkip = true;
      adjustment.nextWateringDate = this.addDays(scheduledDate, 1);
      adjustment.reason = `${weather.rainForecast}mm of rain expected`;
      adjustment.recommendation = `Skip watering ${seed.name}, rain expected soon`;
    }

    // Check temperature
    if (weather.temperature >= prefs.heatIncreaseThreshold) {
      adjustment.shouldIncrease = true;
      adjustment.reason = `High temperature (${weather.temperature}°C)`;
      adjustment.recommendation = `Consider increasing watering frequency for ${seed.name} due to high temperature`;
    }

    // Check wind speed
    if (weather.windSpeed >= prefs.windSpeedThreshold) {
      adjustment.shouldIncrease = true;
      adjustment.reason = `High wind speed (${weather.windSpeed}m/s)`;
      adjustment.recommendation = `Monitor soil moisture for ${seed.name}, high winds may increase water loss`;
    }

    // Check humidity
    if (weather.humidity <= prefs.lowHumidityThreshold) {
      adjustment.shouldIncrease = true;
      adjustment.reason = `Low humidity (${weather.humidity}%)`;
      adjustment.recommendation = `${seed.name} may need extra water due to dry conditions`;
    }

    // Plant-specific adjustments
    this.applyPlantSpecificRules(seed, weather, adjustment);

    return adjustment;
  }

  private static applyPlantSpecificRules(
    seed: Seed,
    weather: WeatherData,
    adjustment: WateringAdjustment
  ): void {
    // Drought-tolerant plants need less adjustment
    if (this.isDroughtTolerant(seed.species)) {
      adjustment.shouldIncrease = false;
      adjustment.recommendation = adjustment.shouldSkip
        ? `${seed.name} is drought-tolerant and rain is expected`
        : '';
    }

    // Moisture-loving plants need more attention
    if (this.isMoistureLovingPlant(seed.species)) {
      adjustment.shouldIncrease = true;
      adjustment.recommendation = `${seed.name} prefers consistent moisture, monitor closely`;
    }

    // Indoor vs outdoor considerations
    if (seed.environment === 'indoor') {
      adjustment.shouldSkip = false; // Don't skip indoor plants based on rain
      if (weather.temperature >= 25) {
        // Indoor temperature threshold
        adjustment.recommendation = `Check soil moisture for ${seed.name}, indoor temperature is high`;
      }
    }
  }

  private static isDroughtTolerant(species: string): boolean {
    const droughtTolerantSpecies = [
      'Aloe vera',
      'Sansevieria trifasciata',
      'Cactaceae',
      'Sedum',
      'Portulaca',
      'Delosperma',
      'Lavandula',
      'Rosmarinus officinalis',
    ];
    return droughtTolerantSpecies.includes(species);
  }

  private static isMoistureLovingPlant(species: string): boolean {
    const moistureLovingSpecies = [
      'Calathea',
      'Fittonia',
      'Spathiphyllum',
      'Alocasia',
      'Colocasia',
      'Impatiens',
      'Hydrangea macrophylla',
    ];
    return moistureLovingSpecies.includes(species);
  }

  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
