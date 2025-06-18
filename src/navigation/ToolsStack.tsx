import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ToolsScreen from '../screens/tools/ToolsScreen';
import NutrientCalculatorScreen from '../screens/tools/NutrientCalculatorScreen';
import LightingCalculatorScreen from '../screens/tools/LightingCalculatorScreen';
import { ToolsStackParamList } from './types';

const Stack = createStackNavigator<ToolsStackParamList>();

export function ToolsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ToolsList"
        component={ToolsScreen}
        options={{
          title: 'Growing Tools',
        }}
      />
      <Stack.Screen
        name="NutrientCalculator"
        component={NutrientCalculatorScreen}
        options={{
          headerShown: true,
          title: 'Nutrient Calculator',
        }}
      />
      <Stack.Screen
        name="LightingCalculator"
        component={LightingCalculatorScreen}
        options={{
          headerShown: true,
          title: 'Lighting Calculator',
        }}
      />
    </Stack.Navigator>
  );
} 