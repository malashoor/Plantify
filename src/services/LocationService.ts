import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

export interface UserLocation {
  coords: {
    latitude: number;
    longitude: number;
  };
  city?: string;
  country?: string;
  timestamp: number;
}

const LOCATION_CACHE_KEY = '@greensai:user_location';
const LOCATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class LocationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      // Check cache first
      const cachedLocation = await this.getCachedLocation();
      if (cachedLocation) {
        return cachedLocation;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'android' ? Location.Accuracy.Balanced : Location.Accuracy.Reduced,
      });

      // Get city and country
      const [placeInfo] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const userLocation: UserLocation = {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        city: placeInfo?.city,
        country: placeInfo?.country,
        timestamp: Date.now(),
      };

      // Cache the location
      await this.cacheLocation(userLocation);

      // Store in Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await this.updateSupabaseLocation(user.id, userLocation);
      }

      return userLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  private static async getCachedLocation(): Promise<UserLocation | null> {
    try {
      const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      if (!cached) return null;

      const location: UserLocation = JSON.parse(cached);
      const now = Date.now();

      // Return cached location if it's less than 24 hours old
      if (now - location.timestamp < LOCATION_CACHE_DURATION) {
        return location;
      }

      return null;
    } catch (error) {
      console.error('Error reading cached location:', error);
      return null;
    }
  }

  private static async cacheLocation(location: UserLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  private static async updateSupabaseLocation(userId: string, location: UserLocation): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          city: location.city,
          country: location.country,
          location_updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating location in Supabase:', error);
    }
  }
} 