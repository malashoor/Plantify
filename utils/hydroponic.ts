import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Types
export interface HydroponicData {
  systemId: string;
  timestamp: string;
  ph: number;
  ec: number;
  tds: number;
  temperature: number;
  dissolvedOxygen: number;
  nutrientLevels: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
  };
}

export interface CalibrationData {
  sensorId: string;
  type: 'ph' | 'ec' | 'tds' | 'temperature';
  referenceValue: number;
  measuredValue: number;
  timestamp: string;
}

// Cache configuration
const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
};

// Sensor calibration and error correction
export class SensorCalibration {
  private static calibrationData: Map<string, CalibrationData> = new Map();

  static async calibrateSensor(data: CalibrationData): Promise<void> {
    this.calibrationData.set(data.sensorId, data);
    await this.saveCalibrationData();
  }

  static async loadCalibrationData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('sensor_calibration');
      if (data) {
        const parsed = JSON.parse(data);
        this.calibrationData = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading calibration data:', error);
    }
  }

  private static async saveCalibrationData(): Promise<void> {
    try {
      const data = Object.fromEntries(this.calibrationData);
      await AsyncStorage.setItem('sensor_calibration', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving calibration data:', error);
    }
  }

  static correctReading(sensorId: string, type: string, value: number): number {
    const calibration = this.calibrationData.get(sensorId);
    if (!calibration || calibration.type !== type) return value;

    // Apply calibration formula
    const slope = calibration.referenceValue / calibration.measuredValue;
    return value * slope;
  }
}

// Data validation and error detection
export class DataValidator {
  static readonly VALID_RANGES = {
    ph: { min: 5.0, max: 7.0 },
    ec: { min: 0.5, max: 3.0 },
    tds: { min: 300, max: 1500 },
    temperature: { min: 15, max: 30 },
    dissolvedOxygen: { min: 5, max: 15 },
  };

  static validateReading(type: string, value: number): boolean {
    const range = this.VALID_RANGES[type as keyof typeof this.VALID_RANGES];
    if (!range) return true;
    return value >= range.min && value <= range.max;
  }

  static detectAnomalies(data: HydroponicData): string[] {
    const anomalies: string[] = [];

    // Check each parameter against valid ranges
    if (!this.validateReading('ph', data.ph)) {
      anomalies.push('pH level out of range');
    }
    if (!this.validateReading('ec', data.ec)) {
      anomalies.push('EC level out of range');
    }
    if (!this.validateReading('temperature', data.temperature)) {
      anomalies.push('Temperature out of range');
    }
    if (!this.validateReading('dissolvedOxygen', data.dissolvedOxygen)) {
      anomalies.push('Dissolved oxygen out of range');
    }

    return anomalies;
  }
}

// Real-time monitoring and data processing
export class HydroponicMonitor {
  private static readonly CACHE_KEY = 'hydroponic_data_';
  private static dataCache: Map<string, HydroponicData[]> = new Map();

  static async initialize(): Promise<void> {
    await SensorCalibration.loadCalibrationData();
    await this.loadCache();
  }

  private static async loadCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const hydroponicKeys = keys.filter((k) => k.startsWith(this.CACHE_KEY));

      for (const key of hydroponicKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const systemId = key.replace(this.CACHE_KEY, '');
          this.dataCache.set(systemId, JSON.parse(data));
        }
      }
    } catch (error) {
      console.error('Error loading hydroponic cache:', error);
    }
  }

  static async getLatestData(systemId: string): Promise<HydroponicData | null> {
    const cachedData = this.dataCache.get(systemId);
    if (cachedData && cachedData.length > 0) {
      return cachedData[cachedData.length - 1];
    }
    return null;
  }

  static async processNewReading(data: HydroponicData): Promise<void> {
    // Apply sensor calibration
    data.ph = SensorCalibration.correctReading(data.systemId, 'ph', data.ph);
    data.ec = SensorCalibration.correctReading(data.systemId, 'ec', data.ec);
    data.temperature = SensorCalibration.correctReading(
      data.systemId,
      'temperature',
      data.temperature,
    );

    // Validate and detect anomalies
    const anomalies = DataValidator.detectAnomalies(data);
    if (anomalies.length > 0) {
      console.warn('Anomalies detected:', anomalies);
      // Trigger alerts or notifications here
    }

    // Update cache
    const cachedData = this.dataCache.get(data.systemId) || [];
    cachedData.push(data);

    // Maintain cache size
    if (cachedData.length > CACHE_CONFIG.maxEntries) {
      cachedData.shift();
    }

    this.dataCache.set(data.systemId, cachedData);

    // Persist to storage
    try {
      await AsyncStorage.setItem(
        this.CACHE_KEY + data.systemId,
        JSON.stringify(cachedData),
      );
    } catch (error) {
      console.error('Error saving hydroponic data:', error);
    }
  }

  static async getHistoricalData(
    systemId: string,
    startTime: string,
    endTime: string,
  ): Promise<HydroponicData[]> {
    const cachedData = this.dataCache.get(systemId) || [];
    return cachedData.filter((data) => {
      const timestamp = new Date(data.timestamp).getTime();
      return (
        timestamp >= new Date(startTime).getTime() &&
        timestamp <= new Date(endTime).getTime()
      );
    });
  }

  static async clearOldData(): Promise<void> {
    const now = Date.now();
    for (const [systemId, data] of this.dataCache.entries()) {
      const filteredData = data.filter((reading) => {
        const age = now - new Date(reading.timestamp).getTime();
        return age <= CACHE_CONFIG.maxAge;
      });

      if (filteredData.length !== data.length) {
        this.dataCache.set(systemId, filteredData);
        await AsyncStorage.setItem(
          this.CACHE_KEY + systemId,
          JSON.stringify(filteredData),
        );
      }
    }
  }
}

// Initialize monitoring system
if (Platform.OS !== 'web') {
  HydroponicMonitor.initialize().catch(console.error);

  // Set up periodic cache cleanup
  setInterval(() => {
    HydroponicMonitor.clearOldData().catch(console.error);
  }, CACHE_CONFIG.maxAge);
}

// Export main monitoring function for component use
export async function getHydroponicData(
  systemId: string,
): Promise<HydroponicData> {
  // Simulated data for testing
  return {
    systemId,
    timestamp: new Date().toISOString(),
    ph: 6.2,
    ec: 1.8,
    tds: 900,
    temperature: 23,
    dissolvedOxygen: 7.5,
    nutrientLevels: {
      nitrogen: 150,
      phosphorus: 50,
      potassium: 200,
      calcium: 180,
      magnesium: 50,
    },
  };
}
