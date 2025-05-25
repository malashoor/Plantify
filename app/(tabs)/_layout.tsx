import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialIcons>['name'];
          if (route.name === 'plants') {
            iconName = 'local-florist';
          } else if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'settings') {
            iconName = 'settings';
          } else {
            iconName = 'help-outline';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="plants" options={{ title: 'Plants' }} />
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
