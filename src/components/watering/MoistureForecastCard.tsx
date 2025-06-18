import React, { useMemo, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { SpeciesProfileService } from '../../services/SpeciesProfileService';
import { SpeciesProfile } from '../../types/species';

interface MoistureForecastCardProps {
  seed: Seed;
  weather: WeatherData;
  nextWatering: Date;
  onOverride?: () => void;
}

export const MoistureForecastCard: React.FC<MoistureForecastCardProps> = ({
  seed,
  weather,
  nextWatering,
  onOverride,
}) => {
  const [profile, setProfile] = useState<SpeciesProfile | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadSpeciesProfile();
  }, [seed.species]);

  const loadSpeciesProfile = async () => {
    const speciesProfile = await SpeciesProfileService.getProfile(seed.species);
    setProfile(speciesProfile);
  };

  const moistureScore = useMemo(() => {
    if (!profile) return null;

    const factors: string[] = [];
    let currentScore = profile.moisture.retentionScore;
    let predictedScore = currentScore;

    // Base adjustments from profile
    if (SpeciesProfileService.isDroughtTolerant(profile)) {
      currentScore += 0.1;
      predictedScore += 0.1;
      factors.push(t('moisture.factor.droughtTolerant'));
    }

    if (SpeciesProfileService.isMoistureLovingPlant(profile)) {
      currentScore -= 0.1;
      predictedScore -= 0.1;
      factors.push(t('moisture.factor.moistureLoving'));
    }

    // Environment adjustments
    if (seed.environment === 'indoor') {
      currentScore += 0.1;
      predictedScore += 0.1;
      factors.push(t('moisture.factor.indoor'));
    }

    // Weather impact
    if (weather.temperature > profile.moisture.moistureThresholds.max) {
      predictedScore -= 0.2;
      factors.push(t('moisture.factor.highTemp'));
    }

    if (weather.humidity < 40) {
      const impact = profile.moisture.humidityPreference * 0.2;
      predictedScore -= impact;
      factors.push(t('moisture.factor.lowHumidity'));
    }

    if (weather.windSpeed > 15 && profile.moisture.sensitivities.wind) {
      predictedScore -= 0.15;
      factors.push(t('moisture.factor.highWind'));
    }

    if (weather.rainForecast > 0) {
      const impact = Math.min(weather.rainForecast / 10, 0.3);
      predictedScore += impact;
      factors.push(t('moisture.factor.rainExpected'));
    }

    // Add relevant care notes
    if (profile.moisture.sensitivities.overwatering) {
      factors.push(t('moisture.factor.overwateringSensitive'));
    }

    if (profile.moisture.sensitivities.temperature) {
      factors.push(t('moisture.factor.temperatureSensitive'));
    }

    // Clamp scores between min and max thresholds
    currentScore = Math.max(
      profile.moisture.moistureThresholds.min,
      Math.min(profile.moisture.moistureThresholds.max, currentScore)
    );
    predictedScore = Math.max(
      profile.moisture.moistureThresholds.min,
      Math.min(profile.moisture.moistureThresholds.max, predictedScore)
    );

    // Determine risk level
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (predictedScore < profile.moisture.moistureThresholds.min) {
      risk = 'high';
    } else if (predictedScore < profile.moisture.moistureThresholds.optimal) {
      risk = 'medium';
    }

    return { current: currentScore, predicted: predictedScore, risk, factors };
  }, [profile, seed, weather, t]);

  if (!profile || !moistureScore) return null;

  // ... rest of the existing render code ...
};
