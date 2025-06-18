import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PromotionsScreen from '../screens/admin/PromotionsScreen';
import PromotionFormScreen from '../screens/admin/PromotionFormScreen';
import { Promotion } from '../types/supabase';

export type AdminStackParamList = {
  Promotions: undefined;
  CreatePromotion: undefined;
  EditPromotion: { promotion: Promotion };
};

const Stack = createStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTintColor: '#000',
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Promotions"
        component={PromotionsScreen}
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="CreatePromotion"
        component={PromotionFormScreen}
        options={{
          title: 'Create Promotion',
        }}
      />
      <Stack.Screen
        name="EditPromotion"
        component={PromotionFormScreen}
        options={{
          title: 'Edit Promotion',
        }}
      />
    </Stack.Navigator>
  );
} 