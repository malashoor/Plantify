import { useState, useEffect } from 'react';
import { WeatherService } from '@services/WeatherService';
import type { WeatherData } from '@services/WeatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WeatherService.getCurrentWeather();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather,
  };
}; 