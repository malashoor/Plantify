import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useRetryableOperation } from '../hooks/useRetryableOperation';
import { RetryOperationKeys } from '../services/RetryOperations';
import { useTheme } from '../hooks/useTheme';
import { useLocation } from '../hooks/useLocation';
import { WeatherData } from '../types/api';
import { RetryQueueStatus } from '../components/common/RetryQueueStatus';
import { WeatherDisplay } from '../components/weather/WeatherDisplay';
import { ErrorView } from '../components/common/ErrorView';

export function WeatherScreen() {
  const { colors } = useTheme();
  const { location } = useLocation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch weather with retry support
  const fetchWeather = useRetryableOperation(
    RetryOperationKeys.FETCH_FORECAST,
    'current-location',
    {
      priority: 'high',
      maxRetries: 5,
      showFeedback: true,
      onSuccess: (data) => {
        setWeatherData(data);
        // After successful fetch, update the cache
        updateCache.execute(data);
      }
    }
  );

  // Update weather cache with retry support
  const updateCache = useRetryableOperation(
    RetryOperationKeys.UPDATE_WEATHER_CACHE,
    'weather-cache',
    {
      priority: 'low',
      maxRetries: 2,
      showFeedback: false,
      isVolatile: true // Cache updates can be lost on app restart
    }
  );

  useEffect(() => {
    if (location) {
      fetchWeather.execute(location.latitude, location.longitude);
    }
  }, [location]);

  const handleRefresh = async () => {
    if (!location || fetchWeather.isProcessing) return;

    setIsRefreshing(true);
    await fetchWeather.execute(location.latitude, location.longitude);
    setIsRefreshing(false);
  };

  const renderContent = () => {
    if (fetchWeather.error) {
      return (
        <ErrorView
          error={fetchWeather.error}
          onRetry={handleRefresh}
          message="Could not load weather data"
        />
      );
    }

    if (!weatherData) {
      return (
        <View style={styles.centerContent}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading weather data...
          </Text>
        </View>
      );
    }

    return <WeatherDisplay data={weatherData} />;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>

      {/* Show retry queue status in development */}
      <RetryQueueStatus showDetails={__DEV__} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
}); 