import { mockServerState } from '../state';

export type WeatherCondition = 'hot' | 'rainy' | 'normal';

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    condition: string;
    timestamp: string;
  };
  forecast: {
    daily: Array<{
      date: string;
      temperature: { min: number; max: number };
      condition: string;
      precipitation?: number;
    }>;
  };
}

const weatherConditions: Record<WeatherCondition, WeatherData> = {
  hot: {
    current: {
      temperature: 35,
      humidity: 45,
      condition: 'sunny',
      timestamp: new Date().toISOString()
    },
    forecast: {
      daily: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString(),
        temperature: { min: 28, max: 38 },
        condition: 'sunny'
      }))
    }
  },
  rainy: {
    current: {
      temperature: 18,
      humidity: 85,
      condition: 'rain',
      timestamp: new Date().toISOString()
    },
    forecast: {
      daily: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString(),
        temperature: { min: 15, max: 22 },
        condition: 'rain',
        precipitation: 25
      }))
    }
  },
  normal: {
    current: {
      temperature: 22,
      humidity: 65,
      condition: 'partly_cloudy',
      timestamp: new Date().toISOString()
    },
    forecast: {
      daily: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString(),
        temperature: { min: 18, max: 25 },
        condition: 'partly_cloudy'
      }))
    }
  }
};

export const weatherScenarios = {
  /**
   * Switch between different weather conditions
   */
  setWeatherCondition(condition: WeatherCondition) {
    const weather = weatherConditions[condition];
    mockServerState.updateState('weather', 'current', weather.current);
    mockServerState.updateState('weather', 'forecast', weather.forecast);
  },

  /**
   * Simulate sudden timeout then recovery
   * @param timeoutDuration Duration of timeout in ms
   */
  simulateTimeoutThenRecover(timeoutDuration: number) {
    // First set timeout
    mockServerState.setMockResponse('/api/weather/current', {
      delay: timeoutDuration
    });

    mockServerState.setMockResponse('/api/weather/forecast', {
      delay: timeoutDuration
    });

    // Schedule recovery
    setTimeout(() => {
      mockServerState.clearMockResponse('/api/weather/current');
      mockServerState.clearMockResponse('/api/weather/forecast');
    }, timeoutDuration + 1000);
  },

  /**
   * Simulate OpenWeather quota exceeded
   */
  simulateQuotaExceeded() {
    const response = {
      status: 429,
      headers: {
        'Retry-After': '3600'
      },
      error: {
        code: 'QUOTA_EXCEEDED',
        message: 'OpenWeather API quota exceeded. Try again in 1 hour.'
      }
    };

    mockServerState.setMockResponse('/api/weather/current', response);
    mockServerState.setMockResponse('/api/weather/forecast', response);
  },

  /**
   * Simulate gradual weather change over time
   * @param duration Total duration of change in ms
   * @param updateInterval Interval between updates in ms
   */
  simulateGradualChange(duration: number, updateInterval: number) {
    const startTemp = 20;
    const endTemp = 30;
    const steps = duration / updateInterval;
    const tempStep = (endTemp - startTemp) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const currentTemp = startTemp + (tempStep * currentStep);

      mockServerState.updateState('weather', 'current', {
        temperature: Math.round(currentTemp),
        humidity: 65,
        condition: currentTemp > 25 ? 'sunny' : 'partly_cloudy',
        timestamp: new Date().toISOString()
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, updateInterval);

    // Cleanup on test reset
    mockServerState.events.once('reset', () => {
      clearInterval(interval);
    });
  },

  /**
   * Simulate flaky weather updates
   * @param failureRate Probability of failure (0-1)
   * @param duration Duration to maintain flaky behavior
   */
  simulateFlakyUpdates(failureRate: number, duration: number) {
    const handleRequest = () => {
      if (Math.random() < failureRate) {
        return {
          status: 500,
          error: {
            code: 'WEATHER_UPDATE_FAILED',
            message: 'Failed to fetch weather data'
          }
        };
      }
      return {
        status: 200,
        data: weatherConditions.normal.current
      };
    };

    mockServerState.setMockResponse('/api/weather/current', handleRequest);
    mockServerState.setMockResponse('/api/weather/forecast', handleRequest);

    // Reset after duration
    setTimeout(() => {
      this.reset();
    }, duration);
  },

  /**
   * Reset all weather scenarios
   */
  reset() {
    mockServerState.clearMockResponse('/api/weather/current');
    mockServerState.clearMockResponse('/api/weather/forecast');
    this.setWeatherCondition('normal');
  }
}; 