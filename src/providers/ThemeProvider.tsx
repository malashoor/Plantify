import React from 'react';
import { useColorScheme } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
  type MD3Theme,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4CAF50',
    secondary: '#45B36B',
    error: '#DC3545',
  },
};

const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4CAF50',
    secondary: '#45B36B',
    error: '#FF4D4D',
  },
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </SafeAreaProvider>
  );
}
