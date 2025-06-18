import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text } from '../components/themed/Text';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { PreferencesService, UserPreferences } from '../services/PreferencesService';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/useAuth';
import { AnalyticsEvent } from '../types/analytics';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOptedOut, setOptOut, isEnabled } = useAnalytics();
  const { user, signOut } = useAuth();
  const [enabled, setEnabled] = useState(isEnabled);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await PreferencesService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert(t('settings.error.title'), t('settings.error.load_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    if (!preferences) return;

    try {
      if (value) {
        // Request location permission when enabling
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('settings.location.permission_needed'),
            t('settings.location.permission_message'),
            [
              { text: t('common.ok'), style: 'default' },
              {
                text: t('settings.location.open_settings'),
                onPress: () => Location.openSettings(),
              },
            ]
          );
          return;
        }
      }

      await Haptics.selectionAsync();
      const updated = await PreferencesService.updatePreferences({
        useLocation: value,
      });
      setPreferences(updated);

      // Announce change for accessibility
      const message = value
        ? t('settings.location.enabled_announcement')
        : t('settings.location.disabled_announcement');
      Alert.alert(message);
    } catch (error) {
      console.error('Error updating location preference:', error);
      Alert.alert(t('settings.error.title'), t('settings.error.update_failed'));
    }
  };

  const handleAnalyticsToggle = async (value: boolean) => {
    setEnabled(!value);
    setOptOut(!value);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (isLoading || !preferences) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={isDark ? '#22C55E' : '#16A34A'} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('settings.location.title')}
        </Text>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <View style={styles.settingHeader}>
              <Ionicons name="location" size={20} color={isDark ? '#22C55E' : '#16A34A'} />
              <Text style={[styles.settingTitle, isDark && styles.settingTitleDark]}>
                {t('settings.location.use_location')}
              </Text>
            </View>
            <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
              {t('settings.location.description')}
            </Text>
          </View>
          <Switch
            value={preferences.useLocation}
            onValueChange={handleLocationToggle}
            trackColor={{ false: '#D1D5DB', true: isDark ? '#065F46' : '#DCF5E9' }}
            thumbColor={preferences.useLocation ? (isDark ? '#22C55E' : '#16A34A') : '#9CA3AF'}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        {preferences.useLocation && (
          <TouchableOpacity
            style={styles.privacyLink}
            onPress={() => {
              /* Navigate to privacy policy */
            }}
            accessibilityRole="link"
            accessibilityHint={t('settings.location.privacy_hint')}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
            <Text style={[styles.privacyText, isDark && styles.privacyTextDark]}>
              {t('settings.location.privacy_policy')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Allow Analytics</Text>
          <Switch
            value={enabled}
            onValueChange={handleAnalyticsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={enabled ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.description}>
          Help us improve by allowing anonymous usage data collection.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Email</Text>
            <Text style={styles.settingDescription}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#9CA3AF',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingTitleDark: {
    color: '#F3F4F6',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingDescriptionDark: {
    color: '#9CA3AF',
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  privacyTextDark: {
    color: '#9CA3AF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
