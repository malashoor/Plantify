import { WeatherData } from './WeatherService';
import { Seed } from '../types/seed';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlertSeverity = 'warning' | 'critical' | 'info';

export interface WeatherAlert {
  id: string;
  type: 'heat' | 'cold' | 'wind' | 'humidity' | 'rain';
  severity: AlertSeverity;
  message: string;
  recommendation: string;
  affectedPlants?: string[];
  timestamp: number;
  acknowledged?: boolean;
}

interface AlertThresholds {
  temperature: {
    high: number;
    critical_high: number;
    low: number;
    critical_low: number;
  };
  humidity: {
    high: number;
    low: number;
  };
  wind: {
    high: number;
    critical: number;
  };
}

// Default thresholds - can be customized per plant type
const DEFAULT_THRESHOLDS: AlertThresholds = {
  temperature: {
    high: 35, // °C
    critical_high: 40,
    low: 10,
    critical_low: 5,
  },
  humidity: {
    high: 80, // %
    low: 20,
  },
  wind: {
    high: 20, // m/s
    critical: 25,
  },
};

const ALERT_CACHE_KEY = '@greensai:weather_alerts';
const ALERT_SETTINGS_KEY = '@greensai:alert_settings';

export class WeatherAlertService {
  static async checkForAlerts(weather: WeatherData, seeds: Seed[]): Promise<WeatherAlert[]> {
    const alerts: WeatherAlert[] = [];
    const timestamp = Date.now();

    // Get custom thresholds if set
    const thresholds = await this.getAlertThresholds();

    // Check temperature
    if (weather.temperature >= thresholds.temperature.critical_high) {
      alerts.push({
        id: `temp_critical_high_${timestamp}`,
        type: 'heat',
        severity: 'critical',
        message: 'Extreme heat warning',
        recommendation:
          'Move sensitive plants to shade, increase watering frequency, and avoid fertilizing',
        affectedPlants: this.getAffectedPlants(seeds, 'heat'),
        timestamp,
      });
    } else if (weather.temperature >= thresholds.temperature.high) {
      alerts.push({
        id: `temp_high_${timestamp}`,
        type: 'heat',
        severity: 'warning',
        message: 'High temperature alert',
        recommendation: 'Consider providing additional shade and monitoring soil moisture',
        affectedPlants: this.getAffectedPlants(seeds, 'heat'),
        timestamp,
      });
    }

    if (weather.temperature <= thresholds.temperature.critical_low) {
      alerts.push({
        id: `temp_critical_low_${timestamp}`,
        type: 'cold',
        severity: 'critical',
        message: 'Frost warning',
        recommendation: 'Move sensitive plants indoors or provide frost protection',
        affectedPlants: this.getAffectedPlants(seeds, 'cold'),
        timestamp,
      });
    } else if (weather.temperature <= thresholds.temperature.low) {
      alerts.push({
        id: `temp_low_${timestamp}`,
        type: 'cold',
        severity: 'warning',
        message: 'Low temperature alert',
        recommendation: 'Monitor sensitive plants and consider moving them to warmer locations',
        affectedPlants: this.getAffectedPlants(seeds, 'cold'),
        timestamp,
      });
    }

    // Check humidity
    if (weather.humidity <= thresholds.humidity.low) {
      alerts.push({
        id: `humidity_low_${timestamp}`,
        type: 'humidity',
        severity: 'warning',
        message: 'Low humidity alert',
        recommendation: 'Consider using a humidity tray or misting your plants',
        timestamp,
      });
    } else if (weather.humidity >= thresholds.humidity.high) {
      alerts.push({
        id: `humidity_high_${timestamp}`,
        type: 'humidity',
        severity: 'warning',
        message: 'High humidity alert',
        recommendation: 'Ensure good air circulation to prevent fungal issues',
        timestamp,
      });
    }

    // Check wind
    if (weather.windSpeed >= thresholds.wind.critical) {
      alerts.push({
        id: `wind_critical_${timestamp}`,
        type: 'wind',
        severity: 'critical',
        message: 'Severe wind warning',
        recommendation: 'Move or protect outdoor plants, especially tall or climbing varieties',
        affectedPlants: this.getAffectedPlants(seeds, 'wind'),
        timestamp,
      });
    } else if (weather.windSpeed >= thresholds.wind.high) {
      alerts.push({
        id: `wind_high_${timestamp}`,
        type: 'wind',
        severity: 'warning',
        message: 'High wind alert',
        recommendation: 'Monitor outdoor plants and check support structures',
        affectedPlants: this.getAffectedPlants(seeds, 'wind'),
        timestamp,
      });
    }

    // Cache new alerts
    await this.cacheAlerts(alerts);

    // Send notifications for critical alerts
    await this.sendAlertNotifications(alerts.filter(a => a.severity === 'critical'));

    return alerts;
  }

  private static getAffectedPlants(seeds: Seed[], condition: 'heat' | 'cold' | 'wind'): string[] {
    switch (condition) {
      case 'heat':
        return seeds
          .filter(s => s.environment === 'outdoor' || this.isHeatSensitive(s.species))
          .map(s => s.name);
      case 'cold':
        return seeds
          .filter(s => s.environment === 'outdoor' || this.isColdSensitive(s.species))
          .map(s => s.name);
      case 'wind':
        return seeds
          .filter(s => s.environment === 'outdoor' && this.isWindSensitive(s))
          .map(s => s.name);
      default:
        return [];
    }
  }

  private static isHeatSensitive(species: string): boolean {
    // Add logic to identify heat-sensitive species
    const heatSensitiveSpecies = ['Camellia japonica', 'Hydrangea macrophylla', 'Lobelia erinus'];
    return heatSensitiveSpecies.includes(species);
  }

  private static isColdSensitive(species: string): boolean {
    // Add logic to identify cold-sensitive species
    const coldSensitiveSpecies = ['Calathea', 'Monstera deliciosa', 'Ficus lyrata'];
    return coldSensitiveSpecies.includes(species);
  }

  private static isWindSensitive(seed: Seed): boolean {
    // Consider both species and growth stage
    const tallPlants = ['Solanum lycopersicum', 'Phaseolus vulgaris'];
    const climbingPlants = ['Pisum sativum', 'Ipomoea purpurea'];
    return tallPlants.includes(seed.species) || climbingPlants.includes(seed.species);
  }

  static async getAlertThresholds(): Promise<AlertThresholds> {
    try {
      const stored = await AsyncStorage.getItem(ALERT_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading alert thresholds:', error);
    }
    return DEFAULT_THRESHOLDS;
  }

  static async setAlertThresholds(thresholds: AlertThresholds): Promise<void> {
    try {
      await AsyncStorage.setItem(ALERT_SETTINGS_KEY, JSON.stringify(thresholds));
    } catch (error) {
      console.error('Error saving alert thresholds:', error);
    }
  }

  static async getCachedAlerts(): Promise<WeatherAlert[]> {
    try {
      const stored = await AsyncStorage.getItem(ALERT_CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading cached alerts:', error);
    }
    return [];
  }

  private static async cacheAlerts(alerts: WeatherAlert[]): Promise<void> {
    try {
      const existing = await this.getCachedAlerts();
      // Keep last 24 hours of alerts
      const recent = existing.filter(a => Date.now() - a.timestamp < 24 * 60 * 60 * 1000);
      const updated = [...recent, ...alerts];
      await AsyncStorage.setItem(ALERT_CACHE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error caching alerts:', error);
    }
  }

  static async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const alerts = await this.getCachedAlerts();
      const updated = alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      await AsyncStorage.setItem(ALERT_CACHE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }

  private static async sendAlertNotifications(alerts: WeatherAlert[]): Promise<void> {
    for (const alert of alerts) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: alert.message,
            body: alert.recommendation,
            data: { alertId: alert.id },
          },
          trigger: null, // Send immediately
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }
}
