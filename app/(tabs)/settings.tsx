import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Switch,
  Alert,
  Platform,
  Linking 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';

const SETTINGS_KEYS = {
  DARK_MODE: 'plantai_dark_mode',
  LANGUAGE: 'plantai_language',
  NOTIFICATIONS: 'plantai_notifications',
  LOCATION: 'plantai_location',
};

export default function Settings() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const darkModeValue = await AsyncStorage.getItem(SETTINGS_KEYS.DARK_MODE);
      const notificationsValue = await AsyncStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS);
      const locationValue = await AsyncStorage.getItem(SETTINGS_KEYS.LOCATION);
      const languageValue = await AsyncStorage.getItem(SETTINGS_KEYS.LANGUAGE);

      if (darkModeValue !== null) setDarkMode(JSON.parse(darkModeValue));
      if (notificationsValue !== null) setNotifications(JSON.parse(notificationsValue));
      if (locationValue !== null) setLocationEnabled(JSON.parse(locationValue));
      if (languageValue !== null) setCurrentLanguage(languageValue);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    saveSetting(SETTINGS_KEYS.DARK_MODE, value);
    // TODO: Implement actual dark mode theme switching
    Alert.alert('Dark Mode', value ? 'Dark mode enabled' : 'Dark mode disabled');
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    saveSetting(SETTINGS_KEYS.NOTIFICATIONS, value);
    Alert.alert('Notifications', value ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleLocationToggle = (value: boolean) => {
    setLocationEnabled(value);
    saveSetting(SETTINGS_KEYS.LOCATION, value);
    Alert.alert('Location', value ? 'Location services enabled' : 'Location services disabled');
  };

  const handleLanguageChange = () => {
    const languages = ['English', 'Spanish', 'French', 'German', 'Arabic'];
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    const newLanguage = languages[nextIndex];
    
    setCurrentLanguage(newLanguage);
    saveSetting(SETTINGS_KEYS.LANGUAGE, newLanguage);
    Alert.alert('Language Changed', `Language set to ${newLanguage}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear user data
              await AsyncStorage.multiRemove(['user_token', 'user_data']);
              // Navigate to auth/login
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const handleRateApp = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        // Fallback to app store
        const appStoreUrl = Platform.OS === 'ios' 
          ? 'https://apps.apple.com/app/plantai' 
          : 'https://play.google.com/store/apps/details?id=com.plantai.app';
        await Linking.openURL(appStoreUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open app store');
    }
  };

  const handleSupport = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://plantai.support.com');
    } catch (error) {
      Alert.alert('Error', 'Could not open support page');
    }
  };

  const handlePrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://plantai.privacy.com');
    } catch (error) {
      Alert.alert('Error', 'Could not open privacy policy');
    }
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <View 
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      }}
      onTouchEnd={onPress}
    >
      <MaterialIcons name={icon as any} size={24} color="#2E7D32" />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent || (
        <MaterialIcons name="chevron-right" size={20} color="#ccc" />
      )}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ 
        padding: 20, 
        backgroundColor: '#2E7D32', 
        alignItems: 'center',
        paddingTop: 60 
      }}>
        <MaterialIcons name="settings" size={48} color="#fff" />
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#fff', 
          marginTop: 12 
        }}>
          Settings
        </Text>
      </View>

      {/* Preferences Section */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: 12,
          paddingHorizontal: 20 
        }}>
          Preferences
        </Text>

        <SettingRow
          icon="dark-mode"
          title="Dark Mode"
          subtitle={darkMode ? 'Enabled' : 'Disabled'}
          rightComponent={
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#767577', true: '#2E7D32' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          }
        />

        <SettingRow
          icon="language"
          title="Language"
          subtitle={currentLanguage}
          onPress={handleLanguageChange}
        />

        <SettingRow
          icon="notifications"
          title="Notifications"
          subtitle={notifications ? 'Enabled' : 'Disabled'}
          rightComponent={
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#767577', true: '#2E7D32' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          }
        />

        <SettingRow
          icon="location-on"
          title="Location Services"
          subtitle={locationEnabled ? 'Enabled' : 'Disabled'}
          rightComponent={
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#767577', true: '#2E7D32' }}
              thumbColor={locationEnabled ? '#fff' : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* More Options */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: 12,
          paddingHorizontal: 20 
        }}>
          More
        </Text>

        <SettingRow
          icon="favorite"
          title="Favorites"
          subtitle="View your favorite plants"
          onPress={() => router.push('/favorites')}
        />

        <SettingRow
          icon="star"
          title="Rate PlantAI"
          subtitle="Help us improve the app"
          onPress={handleRateApp}
        />

        <SettingRow
          icon="help"
          title="Support & FAQ"
          subtitle="Get help and answers"
          onPress={handleSupport}
        />

        <SettingRow
          icon="privacy-tip"
          title="Privacy Policy"
          subtitle="How we protect your data"
          onPress={handlePrivacyPolicy}
        />
      </View>

      {/* Account Actions */}
      <View style={{ marginTop: 30, marginBottom: 40 }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#333', 
          marginBottom: 12,
          paddingHorizontal: 20 
        }}>
          Account
        </Text>

        <SettingRow
          icon="logout"
          title="Logout"
          subtitle="Sign out of your account"
          onPress={handleLogout}
        />
      </View>

      {/* App Version */}
      <View style={{ 
        alignItems: 'center', 
        paddingBottom: 40,
        paddingTop: 20 
      }}>
        <Text style={{ fontSize: 14, color: '#888' }}>
          PlantAI v1.0.0
        </Text>
        <Text style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
          Made with 💚 for plant lovers
        </Text>
      </View>
    </ScrollView>
  );
} 