import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isBoldTextEnabled: boolean;
  preferredContentSizeCategory: string;
  voiceOverSpeedRate: number;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  updateSettings: (settings: Partial<AccessibilitySettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: AccessibilitySettings = {
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isBoldTextEnabled: false,
  preferredContentSizeCategory: 'normal',
  voiceOverSpeedRate: 0.5,
};

const AccessibilityContext = createContext<AccessibilityContextValue>({
  ...defaultSettings,
  updateSettings: async () => {},
  resetSettings: async () => {},
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
    setupAccessibilityListeners();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('@accessibility_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      // Load current device settings
      const [
        screenReader,
        reduceMotion,
        reduceTransparency,
        boldText,
        preferredSize,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        Platform.OS === 'ios' ? AccessibilityInfo.isReduceTransparencyEnabled() : Promise.resolve(false),
        Platform.OS === 'ios' ? AccessibilityInfo.isBoldTextEnabled() : Promise.resolve(false),
        AccessibilityInfo.getPreferredContentSizeCategory(),
      ]);

      setSettings(prev => ({
        ...prev,
        isScreenReaderEnabled: screenReader,
        isReduceMotionEnabled: reduceMotion,
        isReduceTransparencyEnabled: reduceTransparency,
        isBoldTextEnabled: boldText,
        preferredContentSizeCategory: preferredSize,
      }));
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const setupAccessibilityListeners = () => {
    const subscriptions = [
      AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        handleScreenReaderChange
      ),
      AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        handleReduceMotionChange
      ),
    ];

    if (Platform.OS === 'ios') {
      subscriptions.push(
        AccessibilityInfo.addEventListener(
          'reduceTransparencyChanged',
          handleReduceTransparencyChange
        ),
        AccessibilityInfo.addEventListener(
          'boldTextChanged',
          handleBoldTextChange
        ),
      );
    }

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  };

  const handleScreenReaderChange = (isEnabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      isScreenReaderEnabled: isEnabled,
    }));
  };

  const handleReduceMotionChange = (isEnabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      isReduceMotionEnabled: isEnabled,
    }));
  };

  const handleReduceTransparencyChange = (isEnabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      isReduceTransparencyEnabled: isEnabled,
    }));
  };

  const handleBoldTextChange = (isEnabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      isBoldTextEnabled: isEnabled,
    }));
  };

  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };
      await AsyncStorage.setItem(
        '@accessibility_settings',
        JSON.stringify(updatedSettings)
      );
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
    }
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.removeItem('@accessibility_settings');
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error resetting accessibility settings:', error);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
} 