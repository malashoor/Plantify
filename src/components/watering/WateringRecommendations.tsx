import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { format, addDays, isSameDay, differenceInDays } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { DataPoint } from './MoistureTimeline';
import { SpeciesProfile, GrowingMethod } from '../../types/species';
import { WeatherData } from '../../services/WeatherService';

interface WateringRecommendationsProps {
  timelineData: DataPoint[];
  profile: SpeciesProfile;
  weather: WeatherData;
  lastWatering: Date;
  environment: 'indoor' | 'outdoor';
  growingMethod: GrowingMethod;
  onScheduleWatering?: (date: Date) => void;
  isRTL?: boolean;
}

interface Recommendation {
  type: 'water_soon' | 'skip' | 'monitor' | 'urgent' | 'nutrients';
  date?: Date;
  message: string;
  reason: string;
  icon: string;
  severity: 'info' | 'warning' | 'urgent';
  environmentLabel?: string;
}

export const WateringRecommendations: React.FC<WateringRecommendationsProps> = ({
  timelineData,
  profile,
  weather,
  lastWatering,
  environment,
  growingMethod,
  onScheduleWatering,
  isRTL = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const recommendations = useMemo((): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const envFactors = profile.moisture.environmentFactors[environment];
    const isHydroponic = growingMethod.type === 'hydroponic';
    
    // For hydroponic systems, focus on nutrient cycle
    if (isHydroponic) {
      if (growingMethod.nutrientSchedule) {
        const daysSinceLastWatering = differenceInDays(new Date(), lastWatering);
        const nextNutrientDate = addDays(lastWatering, growingMethod.nutrientSchedule.frequencyDays);
        
        if (daysSinceLastWatering >= growingMethod.nutrientSchedule.frequencyDays) {
          recommendations.push({
            type: 'nutrients',
            date: new Date(),
            message: t('recommendations.hydroponic.nutrientsDue'),
            reason: t('recommendations.hydroponic.nutrientsDueReason', {
              solution: growingMethod.nutrientSchedule.solution,
              ppm: growingMethod.nutrientSchedule.ppm,
            }),
            icon: 'test-tube',
            severity: 'warning',
            environmentLabel: t(`environment.${environment}.hydroponic`),
          });
        } else if (daysSinceLastWatering >= growingMethod.nutrientSchedule.frequencyDays - 2) {
          recommendations.push({
            type: 'nutrients',
            date: nextNutrientDate,
            message: t('recommendations.hydroponic.nutrientsSoon'),
            reason: t('recommendations.hydroponic.nutrientsSoonReason', {
              days: format(nextNutrientDate, 'EEEE'),
            }),
            icon: 'test-tube-empty',
            severity: 'info',
            environmentLabel: t(`environment.${environment}.hydroponic`),
          });
        } else {
          recommendations.push({
            type: 'monitor',
            message: t('recommendations.hydroponic.stable'),
            reason: t('recommendations.hydroponic.stableReason', {
              days: differenceInDays(nextNutrientDate, new Date()),
            }),
            icon: 'check-circle-outline',
            severity: 'info',
            environmentLabel: t(`environment.${environment}.hydroponic`),
          });
        }
        
        return recommendations;
      }
    }

    // For soil-based plants, consider environment factors
    const belowOptimalPoint = timelineData.find(point => {
      const adjustedThreshold = environment === 'indoor'
        ? profile.moisture.moistureThresholds.optimal
        : profile.moisture.moistureThresholds.optimal * (1 - envFactors.evaporationRate);
      return point.moisture < adjustedThreshold;
    });

    const criticalPoint = timelineData.find(point => {
      const adjustedThreshold = environment === 'indoor'
        ? profile.moisture.moistureThresholds.min
        : profile.moisture.moistureThresholds.min * (1 - envFactors.evaporationRate);
      return point.moisture < adjustedThreshold;
    });

    // Check weather impact based on environment
    const weatherImpact = environment === 'outdoor' ? {
      highTemp: weather.temperature > 30 * (1 + envFactors.temperatureSensitivity),
      strongWind: weather.windSpeed > 20 * envFactors.windSensitivity,
      lowHumidity: weather.humidity < 30 * envFactors.humidityDependence,
      rainSoon: weather.rainForecast > profile.moisture.moistureThresholds.optimal * 10,
    } : {
      highTemp: false,
      strongWind: false,
      lowHumidity: false,
      rainSoon: false,
    };

    if (criticalPoint) {
      recommendations.push({
        type: 'urgent',
        date: criticalPoint.date,
        message: t('recommendations.urgent.water'),
        reason: t('recommendations.urgent.reason', {
          days: format(criticalPoint.date, 'EEEE'),
          environment: t(`environment.${environment}.soil`),
        }),
        icon: 'water-alert',
        severity: 'urgent',
        environmentLabel: t(`environment.${environment}.soil`),
      });
    } else if (environment === 'outdoor' && weatherImpact.rainSoon) {
      recommendations.push({
        type: 'skip',
        message: t('recommendations.skip.rain'),
        reason: t('recommendations.skip.rainReason', {
          amount: weather.rainForecast,
        }),
        icon: 'weather-rainy',
        severity: 'info',
        environmentLabel: t(`environment.${environment}.soil`),
      });
    } else if (belowOptimalPoint) {
      const weatherFactors = [];
      if (weatherImpact.highTemp) weatherFactors.push(t('weather.highTemp'));
      if (weatherImpact.strongWind) weatherFactors.push(t('weather.strongWind'));
      if (weatherImpact.lowHumidity) weatherFactors.push(t('weather.lowHumidity'));

      recommendations.push({
        type: 'water_soon',
        date: belowOptimalPoint.date,
        message: t('recommendations.water.soon'),
        reason: t('recommendations.water.reason', {
          days: format(belowOptimalPoint.date, 'EEEE'),
          factors: weatherFactors.join(', '),
          environment: t(`environment.${environment}.soil`),
        }),
        icon: 'water-outline',
        severity: 'warning',
        environmentLabel: t(`environment.${environment}.soil`),
      });
    } else {
      recommendations.push({
        type: 'monitor',
        message: t('recommendations.monitor.stable'),
        reason: t('recommendations.monitor.stableReason'),
        icon: 'check-circle-outline',
        severity: 'info',
        environmentLabel: t(`environment.${environment}.soil`),
      });
    }

    return recommendations;
  }, [timelineData, profile, weather, environment, growingMethod, lastWatering, t]);

  const getSeverityColor = (severity: Recommendation['severity']) => {
    switch (severity) {
      case 'urgent':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  const handleRecommendationPress = async (recommendation: Recommendation) => {
    if (!recommendation.date || !onScheduleWatering) return;

    switch (recommendation.severity) {
      case 'urgent':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        await Haptics.selectionAsync();
    }

    onScheduleWatering(recommendation.date);
  };

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <Text style={styles.title}>{t('recommendations.title')}</Text>
      
      {recommendations.map((recommendation, index) => (
        <Pressable
          key={index}
          onPress={() => handleRecommendationPress(recommendation)}
          accessibilityRole="button"
          accessibilityLabel={`${recommendation.message}. ${recommendation.reason}`}
          accessibilityHint={
            recommendation.date
              ? t('recommendations.accessibility.tapToSchedule')
              : undefined
          }
        >
          <Surface
            style={[
              styles.recommendationCard,
              isRTL && styles.recommendationCardRTL,
              { borderLeftColor: getSeverityColor(recommendation.severity) },
            ]}
          >
            <MaterialCommunityIcons
              name={recommendation.icon}
              size={24}
              color={getSeverityColor(recommendation.severity)}
              style={[styles.icon, isRTL && styles.iconRTL]}
            />
            <View style={styles.textContainer}>
              <Text style={styles.message}>{recommendation.message}</Text>
              <Text style={styles.reason}>{recommendation.reason}</Text>
              {recommendation.environmentLabel && (
                <Chip
                  style={styles.environmentChip}
                  textStyle={styles.environmentChipText}
                  icon={environment === 'indoor' ? 'home' : 'tree'}
                >
                  {recommendation.environmentLabel}
                </Chip>
              )}
            </View>
            {recommendation.date && (
              <MaterialCommunityIcons
                name={recommendation.type === 'nutrients' ? 'flask' : 'calendar-plus'}
                size={20}
                color={theme.colors.primary}
                style={styles.actionIcon}
              />
            )}
          </Surface>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  containerRTL: {
    direction: 'rtl',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  recommendationCardRTL: {
    flexDirection: 'row-reverse',
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  icon: {
    marginRight: 16,
  },
  iconRTL: {
    marginRight: 0,
    marginLeft: 16,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionIcon: {
    marginLeft: 16,
  },
  environmentChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  environmentChipText: {
    fontSize: 12,
  },
}); 