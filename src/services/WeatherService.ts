import AsyncStorage from '@react-native-async-storage/async-storage';
import { PreferencesService } from './PreferencesService';
import { LocationService } from './LocationService';
import { OPENWEATHER_CONFIG } from '../config/weather';

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  description: string;
  feelsLike: number;
  windSpeed: number;
  timestamp: number;
}

interface WeatherCache {
  data: WeatherData;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

export class WeatherService {
  static async getCurrentWeather(): Promise<WeatherData | null> {
    try {
      // Check if location is enabled in preferences
      const preferences = await PreferencesService.getPreferences();
      if (!preferences.useLocation) {
        return null;
      }

      // Get current location
      const location = await LocationService.getCurrentLocation();
      if (!location) {
        return null;
      }

      // Check cache first
      const cachedWeather = await this.getCachedWeather(location.coords);
      if (cachedWeather) {
        return cachedWeather;
      }

      // Fetch new weather data
      const weather = await this.fetchWeatherData(location.coords);
      if (weather) {
        await this.cacheWeatherData(weather, location.coords);
      }

      return weather;
    } catch (error) {
      console.error('Error getting weather:', error);
      return null;
    }
  }

  private static async fetchWeatherData(coords: {
    latitude: number;
    longitude: number;
  }): Promise<WeatherData | null> {
    try {
      if (!OPENWEATHER_CONFIG.API_KEY) {
        throw new Error('OpenWeather API key not configured');
      }

      const response = await fetch(
        `${OPENWEATHER_CONFIG.BASE_URL}/weather?` +
          `lat=${coords.latitude}&lon=${coords.longitude}&` +
          `appid=${OPENWEATHER_CONFIG.API_KEY}&units=${OPENWEATHER_CONFIG.UNITS}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        feelsLike: Math.round(data.main.feels_like),
        windSpeed: Math.round(data.wind.speed),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  private static async getCachedWeather(coords: {
    latitude: number;
    longitude: number;
  }): Promise<WeatherData | null> {
    try {
      const cached = await AsyncStorage.getItem(OPENWEATHER_CONFIG.CACHE_KEY);
      if (!cached) return null;

      const cache: WeatherCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cache.timestamp < OPENWEATHER_CONFIG.CACHE_DURATION) {
        // Check if location is roughly the same (within threshold)
        const isSameLocation =
          Math.abs(cache.location.latitude - coords.latitude) <
            OPENWEATHER_CONFIG.LOCATION_THRESHOLD &&
          Math.abs(cache.location.longitude - coords.longitude) <
            OPENWEATHER_CONFIG.LOCATION_THRESHOLD;

        if (isSameLocation) {
          return cache.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error reading weather cache:', error);
      return null;
    }
  }

  private static async cacheWeatherData(
    data: WeatherData,
    coords: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      const cache: WeatherCache = {
        data,
        location: coords,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(OPENWEATHER_CONFIG.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching weather:', error);
    }
  }

  static getWeatherDescription(weather: WeatherData): string {
    const conditions = [];

    // Temperature description
    if (weather.temperature > 35) {
      conditions.push('very hot');
    } else if (weather.temperature > 28) {
      conditions.push('hot');
    } else if (weather.temperature > 20) {
      conditions.push('warm');
    } else if (weather.temperature > 10) {
      conditions.push('mild');
    } else {
      conditions.push('cool');
    }

    // Humidity description
    if (weather.humidity > 70) {
      conditions.push('humid');
    } else if (weather.humidity < 30) {
      conditions.push('dry');
    }

    // Wind description
    if (weather.windSpeed > 20) {
      conditions.push('windy');
    }

    return conditions.join(' and ');
  }

  static getPlantCareAdvice(weather: WeatherData, environment: 'indoor' | 'outdoor'): string {
    const advice: string[] = [];

    if (environment === 'outdoor') {
      // Temperature advice
      if (weather.temperature > 35) {
        advice.push(
          'provide shade during peak hours and water more frequently to prevent heat stress'
        );
      } else if (weather.temperature < 10) {
        advice.push('protect sensitive plants from cold and reduce watering frequency');
      }

      // Humidity advice
      if (weather.humidity < 30) {
        advice.push('consider misting your plants and using mulch to retain moisture');
      } else if (weather.humidity > 70) {
        advice.push('ensure good air circulation to prevent fungal issues');
      }

      // Wind advice
      if (weather.windSpeed > 20) {
        advice.push('provide wind protection and check plant supports');
      }
    } else {
      // Indoor advice based on outdoor conditions
      if (weather.temperature > 35) {
        advice.push('keep plants away from hot windows and maintain indoor humidity');
      } else if (weather.temperature < 10) {
        advice.push('move plants away from cold drafts and reduce watering');
      }

      if (weather.humidity < 30) {
        advice.push('use a humidity tray or humidifier to maintain moisture');
      }
    }

    return advice.join(', ');
  }
}
