import { LocationService, UserLocation } from './LocationService';
import { PreferencesService } from './PreferencesService';
import { WeatherService, WeatherData } from './WeatherService';
import { EmotionService, EmotionalState } from './EmotionService';
import { MemoryService, Memory } from './MemoryService';
import { Seed } from '../types/seed';
import { supabase } from '../lib/supabase';

export interface AIContext {
  location?: {
    city?: string;
    country?: string;
    coords?: {
      latitude: number;
      longitude: number;
    };
  };
  weather?: WeatherData;
  seeds?: {
    total: number;
    environments: {
      indoor: number;
      outdoor: number;
    };
    currentSeed?: {
      name: string;
      species: string;
      environment: string;
      plantedAt: string;
    };
  };
  preferences?: {
    language: string;
    useVoice: boolean;
    useDarkMode: boolean;
  };
  emotionalState?: EmotionalState;
  recentMemories?: {
    insights: string[];
    actions: string[];
    preferences: string[];
    topics: string[];
  };
}

export class AIContextService {
  private static async getUserLocation(): Promise<UserLocation | null> {
    try {
      // Check location preference before accessing location
      const preferences = await PreferencesService.getPreferences();
      if (!preferences.useLocation) {
        return null;
      }

      return await LocationService.getCurrentLocation();
    } catch (error) {
      console.error('Error getting location for AI context:', error);
      return null;
    }
  }

  private static async getUserSeeds(userId: string): Promise<Seed[]> {
    try {
      const { data, error } = await supabase
        .from('seeds')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as Seed[];
    } catch (error) {
      console.error('Error getting seeds for AI context:', error);
      return [];
    }
  }

  private static async getUserEmotionalState(userId: string): Promise<EmotionalState | undefined> {
    try {
      const state = await EmotionService.getEmotionalState(userId);
      return state || undefined;
    } catch (error) {
      console.error('Error getting emotional state for AI context:', error);
      return undefined;
    }
  }

  private static async getUserMemories(userId: string): Promise<{
    insights: string[];
    actions: string[];
    preferences: string[];
    topics: string[];
  }> {
    try {
      // Get recent memories of each type
      const insights = await MemoryService.getRecentMemories(userId, {
        types: ['insight'],
        limit: 3,
        minImportance: 0.7,
      });

      const actions = await MemoryService.getRecentMemories(userId, {
        types: ['action'],
        limit: 3,
        minImportance: 0.6,
      });

      const preferences = await MemoryService.getRecentMemories(userId, {
        types: ['preference'],
        limit: 3,
      });

      const conversations = await MemoryService.getRecentMemories(userId, {
        types: ['conversation'],
        limit: 10,
      });

      return {
        insights: insights.map(m => m.content),
        actions: actions.map(m => m.content),
        preferences: preferences.map(m => m.content),
        topics: Array.from(new Set(conversations.flatMap(m => m.tags))),
      };
    } catch (error) {
      console.error('Error getting memories for AI context:', error);
      return {
        insights: [],
        actions: [],
        preferences: [],
        topics: [],
      };
    }
  }

  static async getContext(currentSeedId?: string): Promise<AIContext> {
    const context: AIContext = {};

    // Get user location
    const location = await this.getUserLocation();
    if (location) {
      context.location = {
        city: location.city,
        country: location.country,
        coords: location.coords,
      };

      // Get weather data if location is available
      const weather = await WeatherService.getCurrentWeather();
      if (weather) {
        context.weather = weather;
      }
    }

    // Get user and seed data if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const seeds = await this.getUserSeeds(user.id);
      
      const environments = {
        indoor: seeds.filter(s => s.environment === 'indoor').length,
        outdoor: seeds.filter(s => s.environment === 'outdoor').length,
      };

      context.seeds = {
        total: seeds.length,
        environments,
      };

      if (currentSeedId) {
        const currentSeed = seeds.find(s => s.id === currentSeedId);
        if (currentSeed) {
          context.seeds.currentSeed = {
            name: currentSeed.name,
            species: currentSeed.species,
            environment: currentSeed.environment,
            plantedAt: currentSeed.planted_at,
          };
        }
      }

      // Get emotional state and memories
      context.emotionalState = await this.getUserEmotionalState(user.id);
      context.recentMemories = await this.getUserMemories(user.id);
    }

    return context;
  }

  static generatePromptContext(context: AIContext): string {
    const parts: string[] = [];

    // Add location and weather context
    if (context.location?.city && context.location?.country) {
      parts.push(`You are assisting a user in ${context.location.city}, ${context.location.country}.`);
      
      if (context.weather) {
        const conditions = WeatherService.getWeatherDescription(context.weather);
        parts.push(
          `Current conditions are ${conditions} ` +
          `(${context.weather.temperature}°C, ${context.weather.humidity}% humidity).`
        );
      }
    } else {
      parts.push('You are assisting a user with plant care.');
    }

    // Add seed context
    if (context.seeds) {
      if (context.seeds.currentSeed) {
        const seed = context.seeds.currentSeed;
        parts.push(
          `They are currently growing ${seed.name} (${seed.species}) in an ${seed.environment} environment, ` +
          `planted on ${new Date(seed.plantedAt).toLocaleDateString()}.`
        );
      }

      if (context.seeds.total > 0) {
        parts.push(
          `They have ${context.seeds.total} plants in total: ` +
          `${context.seeds.environments.indoor} indoor and ` +
          `${context.seeds.environments.outdoor} outdoor.`
        );
      }
    }

    // Add emotional context
    if (context.emotionalState) {
      parts.push(EmotionService.generateEmotionalSummary(context.emotionalState));
    }

    // Add memory context
    if (context.recentMemories) {
      const { insights, actions, preferences, topics } = context.recentMemories;

      if (insights.length) {
        parts.push(`Recent insights: ${insights.join('; ')}`);
      }

      if (actions.length) {
        parts.push(`Recent actions: ${actions.join('; ')}`);
      }

      if (preferences.length) {
        parts.push(`User preferences: ${preferences.join('; ')}`);
      }

      if (topics.length) {
        parts.push(`Recent topics: ${topics.join(', ')}`);
      }
    }

    // Add preferences context if available
    if (context.preferences) {
      const prefs: string[] = [];
      if (context.preferences.language) {
        prefs.push(`prefers ${context.preferences.language}`);
      }
      if (context.preferences.useVoice) {
        prefs.push('uses voice feedback');
      }
      if (prefs.length > 0) {
        parts.push(`User ${prefs.join(' and ')}.`);
      }
    }

    return parts.join(' ');
  }

  static getLocationBasedCareInstructions(context: AIContext): string {
    if (!context.location || !context.seeds?.currentSeed) {
      return this.getGeneralCareInstructions(context.seeds?.currentSeed);
    }

    const currentSeed = context.seeds.currentSeed;
    const { environment } = currentSeed;
    const { city, country } = context.location;
    let advice = '';

    if (context.weather) {
      // Get weather-specific advice
      advice = WeatherService.getPlantCareAdvice(context.weather, environment as 'indoor' | 'outdoor');
      
      if (environment === 'indoor') {
        return `Since you're growing this plant indoors in ${city}, ${country}, where it's ` +
          `currently ${context.weather.temperature}°C with ${context.weather.humidity}% humidity, ` +
          advice;
      } else {
        return `For outdoor growing in ${city}, ${country}, with current conditions of ` +
          `${context.weather.temperature}°C and ${context.weather.humidity}% humidity, ` +
          advice;
      }
    } else {
      // Fallback to basic location-based advice
      if (environment === 'indoor') {
        return `Since you're growing this plant indoors in ${city}, ${country}, ` +
          `ensure proper ventilation and monitor indoor humidity levels. ` +
          `Consider using a humidity tray if the air is dry.`;
      } else {
        return `For outdoor growing in ${city}, ${country}, ` +
          `protect your plant from extreme temperatures and direct sunlight during peak hours. ` +
          `Adjust watering based on local weather conditions.`;
      }
    }
  }

  private static getGeneralCareInstructions(seed?: AIContext['seeds']['currentSeed']): string {
    if (!seed) return '';

    if (seed.environment === 'indoor') {
      return 'For indoor growing, ensure proper ventilation, consistent temperature, ' +
        'and appropriate light exposure based on your plant\'s needs.';
    } else {
      return 'For outdoor growing, monitor weather conditions and protect your plant ' +
        'from extreme temperatures and direct sunlight during peak hours.';
    }
  }
} 