// OpenWeather API configuration
export const OPENWEATHER_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  UNITS: 'metric', // Use Celsius for temperature
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
  CACHE_KEY: '@greensai:weather_cache',
  LOCATION_THRESHOLD: 0.01, // ~1km in coordinates
};

// Validate API key is set
if (!OPENWEATHER_CONFIG.API_KEY) {
  console.warn(
    'OpenWeather API key not found. Please set EXPO_PUBLIC_OPENWEATHER_API_KEY in your environment.'
  );
}
