import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Types
export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  precipitation: number;
  conditions: string;
}

export interface CareRecommendation {
  type: 'watering' | 'protection' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  reason: string;
  validUntil: string;
}

// Cache configuration
const CACHE_CONFIG = {
  weatherDataMaxAge: 30 * 60 * 1000, // 30 minutes
  recommendationsMaxAge: 6 * 60 * 60 * 1000, // 6 hours
};

// Weather thresholds for different plant types
const WEATHER_THRESHOLDS = {
  indoor: {
    temperature: { min: 15, max: 30 },
    humidity: { min: 40, max: 80 },
  },
  outdoor: {
    temperature: { min: 5, max: 35 },
    humidity: { min: 30, max: 90 },
  },
  tropical: {
    temperature: { min: 20, max: 32 },
    humidity: { min: 60, max: 90 },
  },
  succulent: {
    temperature: { min: 10, max: 40 },
    humidity: { min: 20, max: 50 },
  },
};

// Weather-based care recommendation engine
export class WeatherCareEngine {
  private static weatherCache: Map<
    string,
    { data: WeatherData; timestamp: number }
  > = new Map();
  private static recommendationsCache: Map<
    string,
    { recommendations: CareRecommendation[]; timestamp: number }
  > = new Map();

  static async initialize(): Promise<void> {
    await this.loadCache();
  }

  private static async loadCache(): Promise<void> {
    try {
      const weatherData = await AsyncStorage.getItem('weather_cache');
      const recommendationsData = await AsyncStorage.getItem(
        'recommendations_cache',
      );

      if (weatherData) {
        this.weatherCache = new Map(Object.entries(JSON.parse(weatherData)));
      }
      if (recommendationsData) {
        this.recommendationsCache = new Map(
          Object.entries(JSON.parse(recommendationsData)),
        );
      }
    } catch (error) {
      console.error('Error loading weather cache:', error);
    }
  }

  private static async saveCache(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'weather_cache',
        JSON.stringify(Object.fromEntries(this.weatherCache)),
      );
      await AsyncStorage.setItem(
        'recommendations_cache',
        JSON.stringify(Object.fromEntries(this.recommendationsCache)),
      );
    } catch (error) {
      console.error('Error saving weather cache:', error);
    }
  }

  static async getWeatherData(location: string): Promise<WeatherData> {
    const cached = this.weatherCache.get(location);
    if (
      cached &&
      Date.now() - cached.timestamp < CACHE_CONFIG.weatherDataMaxAge
    ) {
      return cached.data;
    }

    // Simulated weather data fetch
    const weatherData: WeatherData = {
      temperature: 25,
      humidity: 65,
      precipitation: 0,
      windSpeed: 10,
      uvIndex: 6,
      forecast: [
        {
          date: new Date(Date.now() + 86400000).toISOString(),
          temperature: { min: 20, max: 28 },
          precipitation: 30,
          conditions: 'partly_cloudy',
        },
        {
          date: new Date(Date.now() + 172800000).toISOString(),
          temperature: { min: 18, max: 26 },
          precipitation: 60,
          conditions: 'rain',
        },
      ],
    };

    this.weatherCache.set(location, {
      data: weatherData,
      timestamp: Date.now(),
    });
    await this.saveCache();

    return weatherData;
  }

  static async generateRecommendations(
    location: string,
    plantType: keyof typeof WEATHER_THRESHOLDS,
  ): Promise<CareRecommendation[]> {
    const cached = this.recommendationsCache.get(`${location}_${plantType}`);
    if (
      cached &&
      Date.now() - cached.timestamp < CACHE_CONFIG.recommendationsMaxAge
    ) {
      return cached.recommendations;
    }

    const weather = await this.getWeatherData(location);
    const thresholds = WEATHER_THRESHOLDS[plantType];
    const recommendations: CareRecommendation[] = [];

    // Temperature recommendations
    if (weather.temperature > thresholds.temperature.max) {
      recommendations.push({
        type: 'protection',
        priority: 'high',
        action: 'Move plant to a cooler location or provide shade',
        reason: 'Temperature exceeds safe maximum',
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      });
    } else if (weather.temperature < thresholds.temperature.min) {
      recommendations.push({
        type: 'protection',
        priority: 'high',
        action: 'Move plant to a warmer location or provide insulation',
        reason: 'Temperature below safe minimum',
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    // Humidity recommendations
    if (weather.humidity < thresholds.humidity.min) {
      recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        action: 'Increase humidity with misting or a humidity tray',
        reason: 'Low humidity conditions',
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      });
    } else if (weather.humidity > thresholds.humidity.max) {
      recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        action: 'Improve air circulation and reduce humidity',
        reason: 'High humidity conditions',
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    // Watering recommendations based on forecast
    const rainTomorrow = weather.forecast[0].precipitation > 30;
    if (plantType === 'outdoor' && rainTomorrow) {
      recommendations.push({
        type: 'watering',
        priority: 'medium',
        action: 'Skip watering as rain is expected',
        reason: 'Natural rainfall forecast',
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    // UV protection
    if (weather.uvIndex > 8 && plantType !== 'succulent') {
      recommendations.push({
        type: 'protection',
        priority: 'high',
        action: 'Provide temporary shade during peak sunlight hours',
        reason: 'High UV levels can damage foliage',
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    // Wind protection
    if (weather.windSpeed > 20 && plantType === 'outdoor') {
      recommendations.push({
        type: 'protection',
        priority: 'urgent',
        action: 'Move potted plants to sheltered location',
        reason: 'Strong winds forecast',
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    this.recommendationsCache.set(`${location}_${plantType}`, {
      recommendations,
      timestamp: Date.now(),
    });
    await this.saveCache();

    return recommendations;
  }

  static async clearOldCache(): Promise<void> {
    const now = Date.now();

    // Clear old weather data
    for (const [location, data] of this.weatherCache.entries()) {
      if (now - data.timestamp > CACHE_CONFIG.weatherDataMaxAge) {
        this.weatherCache.delete(location);
      }
    }

    // Clear old recommendations
    for (const [key, data] of this.recommendationsCache.entries()) {
      if (now - data.timestamp > CACHE_CONFIG.recommendationsMaxAge) {
        this.recommendationsCache.delete(key);
      }
    }

    await this.saveCache();
  }
}

// Initialize weather care engine
if (Platform.OS !== 'web') {
  WeatherCareEngine.initialize().catch(console.error);

  // Set up periodic cache cleanup
  setInterval(() => {
    WeatherCareEngine.clearOldCache().catch(console.error);
  }, CACHE_CONFIG.weatherDataMaxAge);
}

// Export main function for component use
export async function getWeatherBasedRecommendations(
  location: string,
): Promise<string[]> {
  try {
    const recommendations = await WeatherCareEngine.generateRecommendations(
      location,
      'outdoor',
    );
    return recommendations.map((rec) => rec.action);
  } catch (error) {
    console.error('Error getting weather recommendations:', error);
    return [];
  }
}
