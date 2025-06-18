import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Switch } from '@rneui/themed';
import { useAnalytics } from '../src/hooks/useAnalytics';
import { useAuth } from '../src/hooks/useAuth';
import { Stack } from 'expo-router';

export default function SettingsScreen() {
  const { isOptedOut, setOptOut } = useAnalytics();
  const { user, signOut } = useAuth();

  const handleAnalyticsToggle = async (value: boolean) => {
    await setOptOut(!value); // Note: we invert the value since setOptOut(true) means opting out
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLargeTitle: true,
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Analytics Collection</Text>
              <Text style={styles.settingDescription}>
                Help us improve by sharing anonymous usage data
              </Text>
            </View>
            <Switch value={!isOptedOut} onValueChange={handleAnalyticsToggle} color="#2196F3" />
          </View>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
});
