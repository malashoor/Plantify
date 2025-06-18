import { Router, Request, Response } from 'express';
import { mockServerState } from '../state';

const router = Router();

// Get current weather
router.get('/current', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const currentWeather = state.weather.current;

  if (!currentWeather) {
    return res.status(404).json({
      error: {
        code: 'WEATHER_NOT_FOUND',
        message: 'Current weather data not available',
      },
    });
  }

  res.json(currentWeather);
});

// Get weather forecast
router.get('/forecast', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const forecast = state.weather.forecast;

  if (!forecast) {
    return res.status(404).json({
      error: {
        code: 'FORECAST_NOT_FOUND',
        message: 'Weather forecast data not available',
      },
    });
  }

  res.json(forecast);
});

// Update current weather
router.put('/current', (req: Request, res: Response) => {
  const weatherData = {
    ...req.body,
    timestamp: new Date().toISOString(),
  };

  mockServerState.updateState('weather', 'current', weatherData);
  res.json(weatherData);
});

// Update forecast
router.put('/forecast', (req: Request, res: Response) => {
  const forecastData = {
    ...req.body,
    timestamp: new Date().toISOString(),
  };

  mockServerState.updateState('weather', 'forecast', forecastData);
  res.json(forecastData);
});

export default router;
