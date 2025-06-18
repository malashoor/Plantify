import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, ParamListBase, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AdminStack } from './AdminStack';
import { ToolsStack } from './ToolsStack';
import { checkIsAdmin } from '../utils/supabase';
import { useState, useEffect } from 'react';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export function AppNavigator() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const hasAccess = await checkIsAdmin();
      setIsAdmin(hasAccess);
    };

    verifyAdmin();
  }, []);

  const getTabBarIcon = (route: RouteProp<ParamListBase, string>) => {
    return ({ focused, color, size }: TabBarIconProps) => {
      let iconName: keyof typeof Ionicons.glyphMap = 'home';

      if (route.name === 'Home') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === 'Tools') {
        iconName = focused ? 'calculator' : 'calculator-outline';
      } else if (route.name === 'Profile') {
        iconName = focused ? 'person' : 'person-outline';
      } else if (route.name === 'Admin') {
        iconName = focused ? 'settings' : 'settings-outline';
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    };
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: getTabBarIcon(route),
        })}
      >
        <Tab.Screen
          name="Home"
          component={() => <></>} // Replace with your Home component
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="Tools"
          component={ToolsStack}
          options={{
            title: 'Tools',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={() => <></>} // Replace with your Profile component
          options={{ title: 'Profile' }}
        />

        {isAdmin && (
          <Tab.Screen
            name="Admin"
            component={AdminStack}
            options={{
              title: 'Admin',
              headerShown: false,
            }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
