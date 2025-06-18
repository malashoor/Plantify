import React from 'react';
import { Stack } from 'expo-router';
import { Slot } from 'expo-router';
import { enableScreens } from 'react-native-screens';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/lib/i18n';
import { AccessibilityProvider } from '../src/contexts/AccessibilityContext';
import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeProvider as RNEThemeProvider } from '@rneui/themed';

enableScreens();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <AccessibilityProvider>
          <StatusBar style="auto" />
          <Slot />
        </AccessibilityProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}

interface TabIconProps {
  color: string;
  size: number;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: 'My Plants',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="flower" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
