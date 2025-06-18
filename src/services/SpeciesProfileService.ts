import { supabase } from '../lib/supabase';
import { SpeciesProfile, MoistureProfile } from '../types/species';

export class SpeciesProfileService {
  private static readonly TABLE_NAME = 'species_profiles';
  private static readonly CACHE_KEY = '@greensai:species_profiles';
  private static cache: Map<string, SpeciesProfile> = new Map();

  static async getProfile(scientificName: string): Promise<SpeciesProfile | null> {
    // Check cache first
    if (this.cache.has(scientificName)) {
      return this.cache.get(scientificName)!;
    }

    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('scientific_name', scientificName)
        .single();

      if (error) throw error;
      if (!data) return null;

      const profile = this.transformDatabaseRecord(data);
      this.cache.set(scientificName, profile);
      return profile;
    } catch (error) {
      console.error('Error fetching species profile:', error);
      return this.getFallbackProfile(scientificName);
    }
  }

  static async getAllProfiles(): Promise<SpeciesProfile[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*');

      if (error) throw error;
      if (!data) return [];

      const profiles = data.map(this.transformDatabaseRecord);
      profiles.forEach(p => this.cache.set(p.scientificName, p));
      return profiles;
    } catch (error) {
      console.error('Error fetching all species profiles:', error);
      return [];
    }
  }

  private static transformDatabaseRecord(record: any): SpeciesProfile {
    return {
      id: record.id,
      scientificName: record.scientific_name,
      commonNames: record.common_names,
      category: record.category,
      moisture: {
        retentionScore: record.moisture_retention_score,
        droughtTolerance: record.drought_tolerance,
        humidityPreference: record.humidity_preference,
        wateringInterval: {
          summer: record.watering_interval_summer,
          winter: record.watering_interval_winter,
        },
        moistureThresholds: {
          min: record.moisture_threshold_min,
          optimal: record.moisture_threshold_optimal,
          max: record.moisture_threshold_max,
        },
        sensitivities: {
          overwatering: record.sensitive_to_overwatering,
          underwatering: record.sensitive_to_underwatering,
          temperature: record.sensitive_to_temperature,
          wind: record.sensitive_to_wind,
        },
      },
      careNotes: {
        watering: record.watering_notes,
        environment: record.environment_notes,
        seasonal: record.seasonal_notes,
      },
    };
  }

  private static getFallbackProfile(scientificName: string): SpeciesProfile {
    // Provide reasonable defaults based on common plant characteristics
    const defaultMoistureProfile: MoistureProfile = {
      retentionScore: 0.5,
      droughtTolerance: 0.5,
      humidityPreference: 0.5,
      wateringInterval: {
        summer: 7,
        winter: 14,
      },
      moistureThresholds: {
        min: 0.2,
        optimal: 0.5,
        max: 0.8,
      },
      sensitivities: {
        overwatering: false,
        underwatering: false,
        temperature: true,
        wind: false,
      },
    };

    return {
      id: `fallback_${scientificName.toLowerCase().replace(/\s+/g, '_')}`,
      scientificName,
      commonNames: [],
      category: 'houseplant',
      moisture: defaultMoistureProfile,
      careNotes: {
        watering: [
          'Water when top inch of soil feels dry',
          'Adjust frequency based on season and environment',
        ],
        environment: [
          'Maintain consistent moisture levels',
          'Avoid extreme temperature fluctuations',
        ],
        seasonal: [
          'Reduce watering in winter',
          'Monitor more frequently during hot summer months',
        ],
      },
    };
  }

  // Helper method to determine if a plant is drought tolerant
  static isDroughtTolerant(profile: SpeciesProfile): boolean {
    return profile.moisture.droughtTolerance >= 0.7;
  }

  // Helper method to determine if a plant is moisture-loving
  static isMoistureLovingPlant(profile: SpeciesProfile): boolean {
    return (
      profile.moisture.humidityPreference >= 0.7 &&
      profile.moisture.droughtTolerance <= 0.3
    );
  }

  // Calculate optimal watering interval based on current conditions
  static calculateWateringInterval(
    profile: SpeciesProfile,
    temperature: number,
    humidity: number,
    isIndoor: boolean
  ): number {
    const baseInterval = this.getSeasonalInterval(profile, temperature);
    let interval = baseInterval;

    // Adjust for temperature
    if (temperature > 30) {
      interval *= 0.7; // More frequent watering in high heat
    } else if (temperature < 15) {
      interval *= 1.3; // Less frequent in cool weather
    }

    // Adjust for humidity
    if (humidity < 40) {
      interval *= 0.8; // More frequent in dry conditions
    } else if (humidity > 70) {
      interval *= 1.2; // Less frequent in humid conditions
    }

    // Indoor plants typically need less frequent watering
    if (isIndoor) {
      interval *= 1.2;
    }

    // Consider plant-specific factors
    if (profile.moisture.sensitivities.temperature) {
      interval *= temperature > 25 ? 0.9 : 1.1;
    }

    return Math.round(interval);
  }

  private static getSeasonalInterval(profile: SpeciesProfile, temperature: number): number {
    // Simple season detection based on temperature
    const isSummer = temperature > 20;
    return isSummer
      ? profile.moisture.wateringInterval.summer
      : profile.moisture.wateringInterval.winter;
  }
} 