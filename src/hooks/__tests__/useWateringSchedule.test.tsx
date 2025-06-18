import { renderHook } from '@testing-library/react-hooks';
import { useWateringSchedule } from '../useWateringSchedule';
import { WeatherData } from '../../services/WeatherService';
import { SpeciesProfile, EnvironmentFactors } from '../../types/species';
import { SmartWateringService } from '../../services/SmartWateringService';
import { SpeciesProfileService } from '../../services/SpeciesProfileService';

// Mock services
jest.mock('../../services/SmartWateringService');
jest.mock('../../services/SpeciesProfileService');

describe('useWateringSchedule', () => {
  // Test data
  const mockWeather: WeatherData = {
    temperature: 25,
    humidity: 50,
    condition: 'clear',
    description: 'clear sky',
    feelsLike: 26,
    windSpeed: 5,
    timestamp: Date.now(),
  };

  const mockEnvironmentFactors: EnvironmentFactors = {
    evaporationRate: 0.5,
    temperatureSensitivity: 0.7,
    windSensitivity: 0.3,
    humidityDependence: 0.6,
  };

  const mockProfile: SpeciesProfile = {
    id: 'test-species-1',
    name: 'Test Plant',
    scientificName: 'Test Plant',
    commonNames: ['Common Test Plant'],
    category: 'houseplant',
    moisture: {
      moistureThresholds: {
        min: 0.2,
        optimal: 0.5,
        max: 0.8,
      },
      wateringAmount: 250, // ml per watering
      sensitivities: {
        overwatering: false,
        underwatering: false,
      },
      environmentFactors: {
        indoor: mockEnvironmentFactors,
        outdoor: mockEnvironmentFactors,
      },
    },
    growingMethods: [
      {
        type: 'soil',
      },
    ],
    recommendedEnvironments: ['indoor', 'outdoor'],
    careNotes: {
      watering: ['Test watering note'],
      environment: ['Test environment note'],
      seasonal: ['Test seasonal note'],
    },
  };

  const mockBaseInterval = 7;
  const mockLastWatered = new Date('2024-03-10T12:00:00Z');
  const mockNextWatering = new Date('2024-03-17T12:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock service implementations
    (SpeciesProfileService.calculateWateringInterval as jest.Mock).mockReturnValue(
      mockBaseInterval
    );
    (SmartWateringService.evaluateWatering as jest.Mock).mockResolvedValue({
      shouldSkip: false,
      shouldIncrease: false,
      nextWateringDate: mockNextWatering,
      recommendation: 'Normal watering schedule',
      reason: 'Conditions are optimal',
    });
  });

  it('calculates watering schedule with valid inputs', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWateringSchedule({
        weather: mockWeather,
        profile: mockProfile,
        isIndoor: true,
        lastWatered: mockLastWatered,
      })
    );

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitForNextUpdate();

    // Final state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.schedule.baseInterval).toBe(mockBaseInterval);
    expect(result.current.schedule.nextWateringDate).toEqual(mockNextWatering);
    expect(result.current.isAdjusted).toBe(false);
  });

  it('handles missing weather data', async () => {
    const { result } = renderHook(() =>
      useWateringSchedule({
        weather: null,
        profile: mockProfile,
        isIndoor: true,
        lastWatered: mockLastWatered,
      })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.schedule.nextWateringDate).toBe(null);
    expect(result.current.schedule.baseInterval).toBe(null);
  });

  it('handles missing profile data', async () => {
    const { result } = renderHook(() =>
      useWateringSchedule({
        weather: mockWeather,
        profile: null,
        isIndoor: true,
        lastWatered: mockLastWatered,
      })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.schedule.nextWateringDate).toBe(null);
    expect(result.current.schedule.baseInterval).toBe(null);
  });

  it('adjusts schedule for hot and dry conditions', async () => {
    const hotWeather: WeatherData = {
      ...mockWeather,
      temperature: 35,
      humidity: 30,
    };

    (SmartWateringService.evaluateWatering as jest.Mock).mockResolvedValue({
      shouldSkip: false,
      shouldIncrease: true,
      nextWateringDate: new Date('2024-03-15T12:00:00Z'), // Earlier watering
      recommendation: 'Increase watering frequency',
      reason: 'High temperature and low humidity',
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useWateringSchedule({
        weather: hotWeather,
        profile: mockProfile,
        isIndoor: false,
        lastWatered: mockLastWatered,
      })
    );

    await waitForNextUpdate();

    expect(result.current.isAdjusted).toBe(true);
    expect(result.current.schedule.adjustment?.shouldIncrease).toBe(true);
    expect(result.current.schedule.adjustment?.reason).toBe('High temperature and low humidity');
  });

  it('adjusts schedule for rainy conditions', async () => {
    (SmartWateringService.evaluateWatering as jest.Mock).mockResolvedValue({
      shouldSkip: true,
      shouldIncrease: false,
      nextWateringDate: new Date('2024-03-18T12:00:00Z'), // Delayed watering
      recommendation: 'Skip watering',
      reason: 'Rain expected',
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useWateringSchedule({
        weather: mockWeather,
        profile: mockProfile,
        isIndoor: false,
        lastWatered: mockLastWatered,
      })
    );

    await waitForNextUpdate();

    expect(result.current.isAdjusted).toBe(true);
    expect(result.current.schedule.adjustment?.shouldSkip).toBe(true);
    expect(result.current.schedule.adjustment?.reason).toBe('Rain expected');
  });

  it('handles service errors gracefully', async () => {
    const error = new Error('Service error');
    (SpeciesProfileService.calculateWateringInterval as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useWateringSchedule({
        weather: mockWeather,
        profile: mockProfile,
        isIndoor: true,
        lastWatered: mockLastWatered,
      })
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.schedule.nextWateringDate).toBe(null);
  });

  it('updates when dependencies change', async () => {
    interface HookProps {
      weather: WeatherData | null;
      profile: SpeciesProfile | null;
      isIndoor: boolean;
      lastWatered: Date;
    }

    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ weather, profile, isIndoor, lastWatered }: HookProps) =>
        useWateringSchedule({ weather, profile, isIndoor, lastWatered }),
      {
        initialProps: {
          weather: mockWeather,
          profile: mockProfile,
          isIndoor: true,
          lastWatered: mockLastWatered,
        },
      }
    );

    await waitForNextUpdate();

    const updatedWeather = { ...mockWeather, temperature: 30 };
    rerender({
      weather: updatedWeather,
      profile: mockProfile,
      isIndoor: true,
      lastWatered: mockLastWatered,
    });

    await waitForNextUpdate();

    expect(SpeciesProfileService.calculateWateringInterval).toHaveBeenCalledTimes(2);
    expect(SmartWateringService.evaluateWatering).toHaveBeenCalledTimes(2);
  });

  it('cleans up on unmount', async () => {
    const { result, waitForNextUpdate, unmount } = renderHook(() =>
      useWateringSchedule({
        weather: mockWeather,
        profile: mockProfile,
        isIndoor: true,
        lastWatered: mockLastWatered,
      })
    );

    await waitForNextUpdate();
    unmount();

    // No state updates should occur after unmount
    (SmartWateringService.evaluateWatering as jest.Mock).mockResolvedValue({
      shouldSkip: true,
      shouldIncrease: false,
      nextWateringDate: new Date(),
      recommendation: 'Test',
      reason: 'Test',
    });

    expect(result.current.schedule.nextWateringDate).toEqual(mockNextWatering);
  });
});
