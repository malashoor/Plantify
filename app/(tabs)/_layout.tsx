import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: any = 'help-outline';
          
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'plants') {
            iconName = 'local-florist';
          } else if (route.name === 'identify') {
            iconName = 'camera-alt';
          } else if (route.name === 'settings') {
            iconName = 'settings';
          }
          
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Home' }} 
      />
      <Tabs.Screen 
        name="plants" 
        options={{ title: 'Plants' }} 
      />
      <Tabs.Screen 
        name="identify" 
        options={{ title: 'Identify' }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ title: 'Settings' }} 
      />
    </Tabs>
  );
}
