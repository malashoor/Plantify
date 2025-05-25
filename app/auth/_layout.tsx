import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../theme/colors';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: isDark ? Colors.Background.Dark : Colors.Background.Light,
        },
      }}
    />
  );
} 