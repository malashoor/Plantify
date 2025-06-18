import { useColorScheme as useNativeColorScheme } from 'react-native';

export interface ColorScheme {
  isDark: boolean;
  theme: 'light' | 'dark';
}

export function useColorScheme(): ColorScheme {
  const nativeColorScheme = useNativeColorScheme();
  const isDark = nativeColorScheme === 'dark';

  return {
    isDark,
    theme: isDark ? 'dark' : 'light',
  };
}
