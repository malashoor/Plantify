import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { WeatherData } from '../services/WeatherService';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WeatherDisplayProps {
  weather: WeatherData;
  compact?: boolean;
}

const getWeatherIcon = (condition: string): string => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return 'weather-sunny';
    case 'clouds':
      return 'weather-cloudy';
    case 'rain':
      return 'weather-rainy';
    case 'drizzle':
      return 'weather-partly-rainy';
    case 'thunderstorm':
      return 'weather-lightning';
    case 'snow':
      return 'weather-snowy';
    case 'mist':
    case 'fog':
      return 'weather-fog';
    default:
      return 'weather-partly-cloudy';
  }
};

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, compact = false }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const iconName = getWeatherIcon(weather.condition);
  const iconSize = compact ? 24 : 32;

  if (compact) {
    return (
      <View style={[styles.compactContainer, { borderColor: colors.border }]}>
        <MaterialCommunityIcons name={iconName} size={iconSize} color={colors.text} />
        <Text style={[styles.compactText, { color: colors.text }]}>{weather.temperature}°C</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name={iconName} size={iconSize} color={colors.text} />
        <Text style={[styles.title, { color: colors.text }]}>{t('weather.currentConditions')}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>{t('weather.temperature')}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{weather.temperature}°C</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>{t('weather.feelsLike')}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{weather.feelsLike}°C</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>{t('weather.humidity')}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{weather.humidity}%</Text>
        </View>

        {weather.windSpeed > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>{t('weather.windSpeed')}:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{weather.windSpeed} m/s</Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: colors.text }]}>{weather.description}</Text>

      <Text style={[styles.timestamp, { color: colors.text }]}>
        {t('weather.lastUpdated')}: {new Date(weather.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    opacity: 0.8,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
});
