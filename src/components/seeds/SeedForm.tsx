import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CreateSeedInput, UpdateSeedInput, Seed, Environment } from '../../types/seed';
import { EnvironmentSelector } from './EnvironmentSelector';
import { LocationService, UserLocation } from '../../services/LocationService';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';

interface SeedFormProps {
  initialValues?: Partial<Seed>;
  onSubmit: (values: CreateSeedInput | UpdateSeedInput) => Promise<void>;
  isLoading?: boolean;
}

export function SeedForm({ initialValues, onSubmit, isLoading }: SeedFormProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [name, setName] = useState(initialValues?.name || '');
  const [species, setSpecies] = useState(initialValues?.species || '');
  const [environment, setEnvironment] = useState<Environment>(
    initialValues?.environment || 'indoor'
  );
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const userLocation = await LocationService.getCurrentLocation();
      if (userLocation) {
        setLocation(userLocation);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert(t('seeds.location.error_title'), t('seeds.location.error_message'));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !species.trim()) {
      Alert.alert(t('seeds.form.validation_error'), t('seeds.form.required_fields'));
      return;
    }

    try {
      const seedData: CreateSeedInput | UpdateSeedInput = {
        name: name.trim(),
        species: species.trim(),
        environment,
        notes: notes.trim() || undefined,
      };

      if (location) {
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          city: location.city,
          country: location.country,
        };
        Object.assign(seedData, locationData);
      }

      await onSubmit(seedData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error submitting seed:', error);
      Alert.alert(t('seeds.form.submit_error'), t('seeds.form.try_again'));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderLocationInfo = () => {
    if (isLoadingLocation) {
      return (
        <View style={styles.locationContainer}>
          <ActivityIndicator size="small" color={isDark ? '#22C55E' : '#16A34A'} />
          <Text style={[styles.locationText, isDark && styles.locationTextDark]}>
            {t('seeds.location.detecting')}
          </Text>
        </View>
      );
    }

    if (!location) {
      return (
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={fetchLocation}
          accessibilityRole="button"
          accessibilityLabel={t('seeds.location.retry')}
        >
          <Ionicons name="location-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.locationText, isDark && styles.locationTextDark]}>
            {t('seeds.location.not_available')}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color={isDark ? '#22C55E' : '#16A34A'} />
        <Text style={[styles.locationText, isDark && styles.locationTextDark]}>
          {location.city && location.country
            ? `${location.city}, ${location.country}`
            : t('seeds.location.detected')}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderLocationInfo()}

      <TextInput
        style={[styles.input, isDark && styles.inputDark, Platform.OS === 'ios' && styles.iosInput]}
        placeholder={t('seeds.form.name_placeholder')}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={name}
        onChangeText={setName}
        accessibilityLabel={t('seeds.form.name_label')}
        accessibilityHint={t('seeds.form.name_hint')}
      />

      <TextInput
        style={[styles.input, isDark && styles.inputDark, Platform.OS === 'ios' && styles.iosInput]}
        placeholder={t('seeds.form.species_placeholder')}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={species}
        onChangeText={setSpecies}
        accessibilityLabel={t('seeds.form.species_label')}
        accessibilityHint={t('seeds.form.species_hint')}
      />

      <EnvironmentSelector value={environment} onChange={setEnvironment} disabled={isLoading} />

      <TextInput
        style={[
          styles.input,
          styles.notesInput,
          isDark && styles.inputDark,
          Platform.OS === 'ios' && styles.iosInput,
        ]}
        placeholder={t('seeds.form.notes_placeholder')}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
        accessibilityLabel={t('seeds.form.notes_label')}
        accessibilityHint={t('seeds.form.notes_hint')}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          isDark && styles.submitButtonDark,
          isLoading && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
        accessibilityLabel={t('seeds.form.submit_label')}
      >
        {isLoading ? (
          <ActivityIndicator color={isDark ? '#064E3B' : '#F0FDF4'} />
        ) : (
          <Text style={[styles.submitButtonText, isDark && styles.submitButtonTextDark]}>
            {initialValues ? t('seeds.form.update') : t('seeds.form.create')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationTextDark: {
    color: '#9CA3AF',
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#F3F4F6',
  },
  iosInput: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notesInput: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDark: {
    backgroundColor: '#22C55E',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F0FDF4',
  },
  submitButtonTextDark: {
    color: '#064E3B',
  },
});
