import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { format, addDays } from 'date-fns';
import { WeatherData } from '../../services/WeatherService';
import { SpeciesProfile } from '../../types/species';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WateringRecommendations } from './WateringRecommendations';

interface MoistureTimelineProps {
  profile: SpeciesProfile;
  weather: WeatherData;
  lastWatering: Date;
  isIndoor: boolean;
  data: DataPoint[];
  onScheduleWatering?: (date: Date) => void;
  isRTL?: boolean;
}

interface DataPoint {
  date: Date;
  moisture: number;
  optimal: number;
  confidence: number;
}

export const MoistureTimeline: React.FC<MoistureTimelineProps> = ({
  profile,
  weather,
  lastWatering,
  isIndoor,
  data,
  onScheduleWatering,
  isRTL = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width;

  const timelineData = useMemo(() => {
    const days = 7;
    const dataPoints: DataPoint[] = [];
    let currentMoisture = calculateInitialMoisture();

    for (let i = 0; i < days; i++) {
      const date = addDays(new Date(), i);
      const { moisture, optimal, confidence } = predictMoisture(date, currentMoisture);
      dataPoints.push({ date, moisture, optimal, confidence });
      currentMoisture = moisture;
    }

    return dataPoints;
  }, [profile, weather, lastWatering, isIndoor]);

  const calculateInitialMoisture = (): number => {
    const daysSinceWatering = Math.max(
      0,
      (new Date().getTime() - lastWatering.getTime()) / (1000 * 60 * 60 * 24)
    );
    const baseRetention = profile.moisture.retentionScore;
    const initialMoisture = Math.max(
      profile.moisture.moistureThresholds.min,
      1 - daysSinceWatering / (baseRetention * 10)
    );
    return initialMoisture;
  };

  const predictMoisture = (
    date: Date,
    currentMoisture: number
  ): { moisture: number; optimal: number; confidence: number } => {
    let moisture = currentMoisture;
    const optimal = profile.moisture.moistureThresholds.optimal;
    let confidence = 0.9; // Base confidence

    // Daily moisture loss
    const baseLoss = (1 - profile.moisture.retentionScore) * 0.2;

    // Temperature impact
    const tempFactor = Math.max(0, (weather.temperature - 20) / 30);
    moisture -= baseLoss * (1 + tempFactor);

    // Humidity impact
    const humidityFactor = Math.max(0, (70 - weather.humidity) / 70);
    moisture -= baseLoss * humidityFactor;

    // Wind impact
    if (profile.moisture.sensitivities.wind && !isIndoor) {
      const windFactor = Math.min(1, weather.windSpeed / 20);
      moisture -= baseLoss * windFactor;
      confidence *= 1 - windFactor * 0.2;
    }

    // Rain impact
    if (!isIndoor && weather.rainForecast > 0) {
      const rainGain = Math.min(0.3, weather.rainForecast / 20);
      moisture += rainGain;
      confidence *= 0.8; // Rain prediction reduces confidence
    }

    // Indoor adjustment
    if (isIndoor) {
      moisture *= 0.95; // Slower moisture loss indoors
      confidence *= 0.9; // Slightly lower confidence due to variable indoor conditions
    }

    // Clamp moisture between thresholds
    moisture = Math.max(
      profile.moisture.moistureThresholds.min,
      Math.min(profile.moisture.moistureThresholds.max, moisture)
    );

    return { moisture, optimal, confidence };
  };

  const chartData = {
    labels: timelineData.map(d => format(d.date, 'EEE')),
    datasets: [
      {
        data: timelineData.map(d => d.moisture * 100),
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2,
      },
      {
        data: timelineData.map(d => d.optimal * 100),
        color: (opacity = 1) => `${theme.colors.secondary}88`,
        strokeWidth: 1,
        dashPattern: [5, 5],
      },
    ],
    legend: [t('moisture.timeline.current'), t('moisture.timeline.optimal')],
  };

  const chartConfig = {
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.onSurface + opacity.toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => theme.colors.onSurface + opacity.toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.background,
    },
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence > 0.8) return 'check-circle';
    if (confidence > 0.6) return 'alert-circle-outline';
    return 'alert-circle';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('moisture.timeline.title')}</Text>

      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots
        withShadow={false}
        withInnerLines={false}
        withOuterLines
        withVerticalLines={false}
        segments={4}
      />

      <View style={styles.legendContainer}>
        {timelineData.map((point, index) => (
          <View key={index} style={styles.confidenceIndicator}>
            <MaterialCommunityIcons
              name={getConfidenceIcon(point.confidence)}
              size={16}
              color={point.confidence > 0.8 ? theme.colors.primary : theme.colors.warning}
            />
          </View>
        ))}
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.note}>
          {t('moisture.timeline.optimalRange', {
            min: Math.round(profile.moisture.moistureThresholds.optimal * 100),
            max: Math.round(profile.moisture.moistureThresholds.max * 100),
          })}
        </Text>
        {weather.rainForecast > 0 && (
          <Text style={[styles.note, styles.rainNote]}>
            {t('moisture.timeline.rainExpected', {
              amount: weather.rainForecast,
            })}
          </Text>
        )}
      </View>

      <WateringRecommendations
        timelineData={data}
        profile={profile}
        weather={weather}
        lastWatering={lastWatering}
        onScheduleWatering={onScheduleWatering}
        isRTL={isRTL}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  confidenceIndicator: {
    alignItems: 'center',
    padding: 4,
  },
  notesContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  note: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  rainNote: {
    color: '#1976d2',
    fontStyle: 'italic',
  },
});
